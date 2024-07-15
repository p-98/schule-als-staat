import type { IAppContext } from "Server";

import { v4 as uuid } from "uuid";
import {
    fileToDataUrl,
    parseVoteChoices,
    parseVoteResult,
    parseVoteVote,
    stringifyVoteChoices,
    stringifyVoteResult,
    stringifyVoteVote,
} from "Util/parse";
import type { IVoteModel } from "Types/models";
import type { TVoteInput } from "Types/schema";
import { IVote, IVotingPaper } from "Types/knex";
import { assertRole, checkRole } from "Util/auth";
import { assert, GraphQLYogaError } from "Util/error";
import { isFuture } from "date-fns";
import {
    all,
    divide,
    eq,
    get,
    isEqual,
    isNull,
    isUndefined,
    map,
    partition,
    pipe,
    set,
    sum,
    __,
} from "lodash/fp";
import { average, pipe1, transpose } from "Util/misc";

const catchNoVotes =
    (f: (_: number[][]) => number[]) =>
    (votes: number[][], numChoices: number) =>
        votes.length === 0 ? Array<number>(numChoices).fill(0.0) : f(votes);
const resultFns = {
    RADIO: catchNoVotes((votes) =>
        pipe1(votes, transpose, map(pipe(sum, divide(__, votes.length))))
    ),
    CONSENSUS: catchNoVotes((votes) => pipe1(votes, transpose, map(average))),
};
const ensureResult = async <T extends IVote>(
    { knex }: IAppContext,
    vote: T
): Promise<T> => {
    const resultNotNeeded = isFuture(new Date(vote.endAt));
    const resultAlreadyPresent = !isNull(vote.result);
    if (resultNotNeeded || resultAlreadyPresent) return vote;

    const votes = await knex("votingPapers")
        .where({ voteId: vote.id })
        .then(map<IVotingPaper, number[]>(pipe(get("vote"), parseVoteVote)));
    const numChoices = parseVoteChoices(vote.choices).length;
    const result = resultFns[vote.type](votes, numChoices);

    const resultStr = stringifyVoteResult(result);
    await knex("votes").update({ result: resultStr }).where({ id: vote.id });
    return set("result", resultStr, vote);
};

export async function getAllVotes(ctx: IAppContext): Promise<IVoteModel[]> {
    const { knex, session } = ctx;
    assert(
        checkRole(ctx, session.userSignature, "CITIZEN") ||
            checkRole(ctx, session.userSignature, "POLITICS"),
        "Nicht als Bürger oder politischer Administrator angemeldet.",
        "PERMISSION_DENIED"
    );

    const isPolitics = checkRole(ctx, session.userSignature, "POLITICS");
    const votes: (IVote & Pick<IVotingPaper, "vote">)[] = isPolitics
        ? await knex.raw(
              `SELECT votes.*
              FROM votes`
          )
        : await knex.raw(
              `SELECT votes.*, votingPapers.vote
              FROM votes
              LEFT JOIN votingPapers
                ON votingPapers.voteId = votes.id
               AND votingPapers.citizenId = :citizenId`,
              { citizenId: session.userSignature.id }
          );

    const votesWithResult = await Promise.all(
        votes.map((_) => ensureResult(ctx, _))
    );
    return votesWithResult.map((raw) => ({
        ...raw,
        choices: parseVoteChoices(raw.choices),
        result: raw.result ? parseVoteResult(raw.result) : null,
        votingPaper: raw.vote ? parseVoteVote(raw.vote) : null,
    }));
}

export async function createVote(
    ctx: IAppContext,
    { type, title, description, image, endAt, choices }: TVoteInput
): Promise<IVoteModel> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "POLITICS");
    assert(
        title.trim() !== "",
        "Titel darf nicht leer sein.",
        "BAD_USER_INPUT"
    );
    assert(
        isFuture(new Date(endAt)),
        "Ende muss in der Zukunft liegen",
        "BAD_USER_INPUT"
    );
    assert(choices.length > 0, "Choices must not be empty", "BAD_USER_INPUT");
    assert(
        all((_) => _.trim() !== "", choices),
        "Keine Option darf leer sein.",
        "BAD_USER_INPUT"
    );
    return knex.transaction(async (trx) => {
        const inserted = await trx("votes")
            .insert({
                id: uuid(),
                type,
                title,
                description,
                image: await fileToDataUrl(image),
                endAt,
                choices: stringifyVoteChoices(choices),
            })
            .returning("*");
        const vote = inserted[0]!;
        return {
            ...vote,
            choices: parseVoteChoices(vote.choices),
            result: vote.result ? parseVoteResult(vote.result) : null,
            votingPaper: null,
        };
    });
}

export async function deleteVote(ctx: IAppContext, id: string): Promise<void> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "POLITICS");
    return knex.transaction(async (trx) => {
        await trx("votingPapers").delete().where({ voteId: id });
        const deleted = await trx("votes").delete().where({ id });
        assert(
            deleted > 0,
            `Abstimmung mit id '${id}' nicht gefunden.`,
            "VOTE_NOT_FOUND"
        );
    });
}

export async function castVote(
    ctx: IAppContext,
    voteId: string,
    votingPaper: number[]
): Promise<IVoteModel> {
    const { knex, session } = ctx;
    return knex.transaction(async (trx) => {
        assertRole(ctx, session.userSignature, "CITIZEN");

        const vote = await trx("votes").where({ id: voteId }).first();
        assert(
            !isUndefined(vote),
            `Abstimmung mit id '${voteId}' nicht gefunden.`,
            "VOTE_NOT_FOUND"
        );
        const choices = parseVoteChoices(vote.choices);
        assert(
            choices.length === votingPaper.length,
            `Stimmzettel muss ${choices.length} Werte enthalten.`,
            "BAD_USER_INPUT"
        );
        assert(
            all((_) => _ <= 1 && _ >= 0, votingPaper),
            "Jede Stimme muss zwischen 0 und 1 sein.",
            "BAD_USER_INPUT"
        );
        if (vote.type === "RADIO")
            assert(
                pipe(partition(eq(0.0)), get(1), isEqual([1.0]))(votingPaper),
                "Eine Stimme muss mit 1.0 ausgewählt und alle anderen auf 0.0 gesetzt werden.",
                "BAD_USER_INPUT"
            );
        assert(
            new Date() < new Date(vote.endAt),
            "Abstimmung hat bereits geendet.",
            "VOTE_ENDED"
        );

        await trx("votingPapers")
            .insert({
                voteId,
                citizenId: session.userSignature.id,
                vote: stringifyVoteVote(votingPaper),
            })
            .catch((err: Error & { code?: string }) => {
                if (err.code === "SQLITE_CONSTRAINT_PRIMARYKEY")
                    throw new GraphQLYogaError(
                        `Vote for id ${voteId} already casted`,
                        { code: "VOTE_ALREADY_CASTED" }
                    );
                throw err;
            });
        const selected: (IVote & Partial<Pick<IVotingPaper, "vote">>)[] =
            await trx.raw(
                `SELECT votes.*, votingPapers.vote
                FROM votes
                LEFT JOIN votingPapers
                       ON votingPapers.voteId = votes.id
                WHERE votes.id = :voteId AND votingPapers.citizenId = :citizenId`,
                { voteId, citizenId: session.userSignature.id }
            );
        const newVote = selected[0]!;
        return {
            ...newVote,
            choices: parseVoteChoices(newVote.choices),
            result: newVote.result ? parseVoteResult(newVote.result) : null,
            votingPaper: parseVoteVote(newVote.vote!),
        };
    });
}
