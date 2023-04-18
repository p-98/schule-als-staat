import type { IAppContext } from "Server";

import {
    parseVoteChoices,
    parseVoteResult,
    parseVoteVote,
    safeParseInt,
    stringifyVoteChoices,
    stringifyVoteVote,
} from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import type { IVoteCitizenEdgeModel, IVoteModel } from "Types/models";
import type { TVoteType } from "Types/schema";
import { IVote, IVotingPaper } from "Types/knex";

export async function getVotes(
    { knex }: IAppContext,
    voteId: number
): Promise<IVoteCitizenEdgeModel[]> {
    const query = knex("votingPapers")
        .select()
        .where({ voteId })
        .innerJoin("votes", "votingPapers.voteId", "votes.id");

    return (await query).map((raw) => ({
        ...raw,
        vote: parseVoteVote(raw.vote),
    }));
}

export async function getAllVotes({
    knex,
}: IAppContext): Promise<IVoteModel[]> {
    const query = knex("votes")
        .select("*")
        .where("endAt", ">", formatDateTimeZ(new Date()));

    return (await query).map((raw) => ({
        ...raw,
        choices: parseVoteChoices(raw.choices),
        result: raw.result ? parseVoteResult(raw.result) : null,
    }));
}

export async function createVote(
    { knex }: IAppContext,
    type: TVoteType,
    title: string,
    description: string,
    image: string,
    endAt: string,
    choices: string[]
): Promise<IVoteModel> {
    return knex.transaction(async (trx) => {
        await trx("votes").insert({
            type,
            title,
            description,
            image,
            endAt,
            choices: stringifyVoteChoices(choices),
        });
        const raw = (await trx("votes")
            .select("*")
            .where({ id: knex.raw("last_insert_rowid()") })
            .first()) as IVote;
        return {
            ...raw,
            choices: parseVoteChoices(raw.choices),
            result: raw.result ? parseVoteResult(raw.result) : null,
        };
    });
}

export async function vote(
    { knex }: IAppContext,
    citizenId: string,
    voteId: string,
    _vote: number[] // name conflict with function `vote`
): Promise<IVoteCitizenEdgeModel> {
    const voteIdNum = safeParseInt(voteId, 10);
    return knex.transaction(async (trx) => {
        await trx("votingPapers").insert({
            voteId: voteIdNum,
            citizenId,
            vote: stringifyVoteVote(_vote),
        });
        const raw = (await trx("votingPapers")
            .select("*")
            .where({ voteId: voteIdNum, citizenId })
            .first()) as IVotingPaper;
        return { ...raw, vote: parseVoteVote(raw.vote) };
    });
}
