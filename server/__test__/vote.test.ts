import { test, beforeEach, afterEach, jest } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    assertInvalid,
    type TUserExecutor,
    createTestServer,
    config,
} from "Util/test";

import { omit } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { fetch, File } from "@whatwg-node/fetch";
import { type TVoteType } from "Types/schema";
import { type Knex } from "Database";
import { type TYogaServerInstance } from "Server";
import { graphql } from "./graphql";

const AllVoteFragment = graphql(/* GraphQL */ `
    fragment All_VoteFragment on Vote {
        id
        type
        title
        description
        image
        endAt
        choices
        votingPaper
        result
        chartInfo
    }
`);
const createVoteMutation = graphql(/* GraphQL */ `
    mutation CreateVote($vote: VoteInput!) {
        createVote(vote: $vote) {
            ...All_VoteFragment
        }
    }
`);
const deleteVoteMutation = graphql(/* GraphQL */ `
    mutation DeleteVote($id: ID!) {
        deleteVote(id: $id)
    }
`);
const castVoteMutation = graphql(/* GraphQL */ `
    mutation CastVote($id: ID!, $votingPaper: [Float!]!) {
        castVote(id: $id, votingPaper: $votingPaper) {
            ...All_VoteFragment
        }
    }
`);
const votesStateQuery = graphql(/* GraphQL */ `
    query VotesState {
        votes {
            ...All_VoteFragment
        }
    }
`);

type IVote = ResultOf<typeof AllVoteFragment>;
type IVoteState = ResultOf<typeof votesStateQuery>["votes"];

const now = "2023-10-16T13:00:00.000+02:00";
const endAt = "2023-10-17T13:00:00.000+02:00";

let knex: Knex;
let yoga: TYogaServerInstance;
let citizen1: TUserExecutor;
let citizen2: TUserExecutor;
let politics: TUserExecutor;
let citizenWithIdOfPolitics: TUserExecutor;
let company: TUserExecutor;
let guest: TUserExecutor;
beforeEach(async () => {
    jest.useFakeTimers({ advanceTimers: true, now: new Date(now) });
    [knex, yoga] = await createTestServer();
    citizen1 = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    citizen2 = await buildHTTPUserExecutor(knex, yoga, { type: "CITIZEN" });
    politics = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.policiticsCompanyId,
    });
    citizenWithIdOfPolitics = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: politics.id,
    });
    company = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
    });
    guest = await buildHTTPUserExecutor(knex, yoga, { type: "GUEST" });
});
afterEach(async () => {
    await knex.destroy();
});

// curried for better formatting
const assertVotesState =
    (user: TUserExecutor) => async (expected: IVoteState, message: string) => {
        const result = await user({ document: votesStateQuery });
        assertSingleValue(result);
        assertNoErrors(result);
        assert.deepStrictEqual(result.data.votes, expected, message);
    };

async function testCreateVote(type: TVoteType): Promise<IVote> {
    const imageUrl =
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const imageFile = await fetch(imageUrl)
        .then((res) => res.blob())
        .then((blob) => new File([blob], "Image Name", { type: "image/gif" }));
    const voteInput = {
        type,
        title: "Vote Title",
        description: "Vote description",
        image: imageFile,
        endAt,
        choices: ["Purple", "Orange"],
    };

    // invalid requests
    const invalidTitle = await politics({
        document: createVoteMutation,
        variables: { vote: { ...voteInput, title: "  " } },
    });
    assertInvalid(invalidTitle, "BAD_USER_INPUT");
    const invalidEndAt = await politics({
        document: createVoteMutation,
        variables: {
            vote: { ...voteInput, endAt: "2023-10-15T13:00:00.000+02:00" },
        },
    });
    assertInvalid(invalidEndAt, "BAD_USER_INPUT");
    const emptyChoices = await politics({
        document: createVoteMutation,
        variables: { vote: { ...voteInput, choices: [] } },
    });
    assertInvalid(emptyChoices, "BAD_USER_INPUT");
    const InvalidChoice = await politics({
        document: createVoteMutation,
        variables: {
            vote: { ...voteInput, choices: [...voteInput.choices, "  "] },
        },
    });
    assertInvalid(InvalidChoice, "BAD_USER_INPUT");
    const wrongUserId = await company({
        document: createVoteMutation,
        variables: { vote: voteInput },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfPolitics({
        document: createVoteMutation,
        variables: { vote: voteInput },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const createVote = await politics({
        document: createVoteMutation,
        variables: { vote: voteInput },
    });
    assertSingleValue(createVote);
    assertNoErrors(createVote);
    const vote = createVote.data.createVote;
    assert.deepStrictEqual(omit("id", vote), {
        ...voteInput,
        image: imageUrl,
        votingPaper: null,
        result: null,
        chartInfo: null,
    });

    return vote;
}
async function testDeleteVote(vote: IVote): Promise<void> {
    // invalid requests
    const invalidId = await politics({
        document: deleteVoteMutation,
        variables: { id: "invalidVoteId" },
    });
    assertInvalid(invalidId, "VOTE_NOT_FOUND");
    const wrongUserId = await company({
        document: deleteVoteMutation,
        variables: { id: vote.id },
    });
    assertInvalid(wrongUserId, "PERMISSION_DENIED");
    const wrongUserType = await citizenWithIdOfPolitics({
        document: deleteVoteMutation,
        variables: { id: vote.id },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");

    // valid request
    const deleteVote = await politics({
        document: deleteVoteMutation,
        variables: { id: vote.id },
    });
    assertSingleValue(deleteVote);
    assertNoErrors(deleteVote);
    assert.strictEqual(deleteVote.data.deleteVote, null);

    // invalid after delete
    const deleteAgain = await politics({
        document: deleteVoteMutation,
        variables: { id: vote.id },
    });
    assertInvalid(deleteAgain, "VOTE_NOT_FOUND");
    const castVote = await citizen1({
        document: castVoteMutation,
        variables: { id: vote.id, votingPaper: [1.0, 0.0] },
    });
    assertInvalid(castVote, "VOTE_NOT_FOUND");
}

async function testCastVote(
    citizen: TUserExecutor,
    vote: IVote,
    votingPaper: number[]
): Promise<IVote> {
    const { id } = vote;
    // invalid requests
    const invalidId = await citizen({
        document: castVoteMutation,
        variables: { id: "invalidVoteId", votingPaper },
    });
    assertInvalid(invalidId, "VOTE_NOT_FOUND");
    const valueTooLow = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper: [-1.0, 0.0] },
    });
    assertInvalid(valueTooLow, "BAD_USER_INPUT");
    const valueTooHigh = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper: [2.0, 0.0] },
    });
    assertInvalid(valueTooHigh, "BAD_USER_INPUT");
    if (vote.type === "RADIO") {
        const twoSelected = await citizen({
            document: castVoteMutation,
            variables: { id, votingPaper: [1.0, 1.0] },
        });
        assertInvalid(twoSelected, "BAD_USER_INPUT");
        const noneSelected = await citizen({
            document: castVoteMutation,
            variables: { id, votingPaper: [0.0, 0.0] },
        });
        assertInvalid(noneSelected, "BAD_USER_INPUT");
        const invalidValue = await citizen({
            document: castVoteMutation,
            variables: { id, votingPaper: [0.5, 0.0] },
        });
        assertInvalid(invalidValue, "BAD_USER_INPUT");
    }
    const invalidChoiceNum = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper: [1.0, 0.0, 0.0] },
    });
    assertInvalid(invalidChoiceNum, "BAD_USER_INPUT");
    const wrongUserType = await guest({
        document: castVoteMutation,
        variables: { id, votingPaper },
    });
    assertInvalid(wrongUserType, "PERMISSION_DENIED");
    jest.setSystemTime(new Date(endAt));
    const tooLate = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper },
    });
    assertInvalid(tooLate, "VOTE_ENDED");
    jest.setSystemTime(new Date(now));

    // valid request
    const castVote = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper },
    });
    assertSingleValue(castVote);
    assertNoErrors(castVote);
    const newVote = castVote.data.castVote;
    assert.deepStrictEqual(newVote, { ...vote, votingPaper });

    // invalid after cast
    const castAgain = await citizen({
        document: castVoteMutation,
        variables: { id, votingPaper },
    });
    assertInvalid(castAgain, "VOTE_ALREADY_CASTED");

    return newVote;
}

const testAll = async (
    type: TVoteType,
    votingPaper1: number[],
    votingPaper2: number[],
    result: number[],
    testDelete?: boolean
) => {
    await assertVotesState(politics)(
        [],
        "No votes must be pesent at beginning"
    );
    await assertVotesState(citizen1)(
        [],
        "No votes must be pesent at beginning"
    );
    await assertVotesState(citizen2)(
        [],
        "No votes must be pesent at beginning"
    );

    const vote = await testCreateVote(type);
    await assertVotesState(politics)(
        [vote],
        "Vote must be present after create"
    );
    await assertVotesState(citizen1)(
        [vote],
        "Vote must be present after create"
    );
    await assertVotesState(citizen2)(
        [vote],
        "Vote must be present after create"
    );

    if (testDelete) {
        await testDeleteVote(vote);
        await assertVotesState(politics)(
            [],
            "No votes must be pesent after delete"
        );
        await assertVotesState(citizen1)(
            [],
            "No votes must be pesent after delete"
        );
        await assertVotesState(citizen2)(
            [],
            "No votes must be pesent after delete"
        );
        return;
    }

    await testCastVote(citizen1, vote, votingPaper1);
    await assertVotesState(citizen1)(
        [{ ...vote, votingPaper: votingPaper1 }],
        "Vote with paper must be present after first cast"
    );
    await assertVotesState(citizen2)(
        [vote],
        "Original Vote must be present after first cast"
    );

    await testCastVote(citizen2, vote, votingPaper2);
    await assertVotesState(citizen1)(
        [{ ...vote, votingPaper: votingPaper1 }],
        "Vote with paper must still be present after second cast"
    );
    await assertVotesState(citizen2)(
        [{ ...vote, votingPaper: votingPaper2 }],
        "Vote with paper must be present after second cast"
    );

    jest.setSystemTime(new Date(endAt));
    await assertVotesState(politics)(
        [{ ...vote, result }],
        "Vote with result must be present after end"
    );
    await assertVotesState(citizen1)(
        [{ ...vote, votingPaper: votingPaper1, result }],
        "Vote with paper and result must be present after end"
    );
    await assertVotesState(citizen2)(
        [{ ...vote, votingPaper: votingPaper2, result }],
        "Vote with paper and result must be present after end"
    );
};

test("create, delete", () =>
    testAll("RADIO", [1.0, 0.0], [0.0, 1.0], [0.5, 0.5], true));
test("radio create, cast, result", () =>
    testAll("RADIO", [1.0, 0.0], [0.0, 1.0], [0.5, 0.5]));
test("consensus create, cast, result", () =>
    testAll("CONSENSUS", [0.8, 1.0], [0.0, 1.0], [0.4, 1.0]));
