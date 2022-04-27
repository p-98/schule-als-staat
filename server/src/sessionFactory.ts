import type { IncomingMessage, ServerResponse } from "http";
import type { TUserSignature } from "Types";
import cookie from "cookie";
import { v4 as uuid } from "uuid";
import { addMonths } from "date-fns";
import { knex } from "Database";

export interface ISession {
    id: string;
    user: null | TUserSignature;
}

async function create(tries = 0): Promise<ISession> {
    const id = uuid();

    try {
        await knex("sessions").insert({ id });
    } catch (err) {
        if (
            (err as Error & { code: string }).code !==
            "SQLITE_CONSTRAINT_PRIMARYKEY"
        )
            throw err;

        if (tries < 100) return create(tries + 1);
        throw new Error("Failed to generate unique sessionID");
    }

    return { id, user: null };
}

async function load(id: string): Promise<ISession> {
    const session = await knex("sessions").first("user").where({ id });

    // if session was not found, create a new one
    if (!session) return create();

    const user = session.user
        ? (JSON.parse(session.user) as TUserSignature)
        : null;
    return { id, user };
}

/** authenticates client and provides session object */
export default async function init(
    req: IncomingMessage,
    res: ServerResponse
): Promise<ISession> {
    const id = cookie.parse(req.headers.cookie ?? "").sessionID;

    const session = id ? await load(id) : await create();

    res.setHeader(
        "Set-Cookie",
        cookie.serialize("sessionID", session.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: addMonths(new Date(), 6),
        })
    );

    return session;
}
