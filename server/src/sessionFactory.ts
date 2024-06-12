import type { ISessionModel, IUserSignature } from "Types/models";
import type { WithCookieStore } from "Util/misc";
import type { Knex } from "Database";

import { v4 as uuid } from "uuid";
import { addMonths } from "date-fns";

async function create(knex: Knex, tries = 100): Promise<ISessionModel> {
    const session = { id: uuid(), userSignature: null };

    try {
        await knex("sessions").insert(session);
    } catch (err) {
        if (
            (err as Error & { code: string }).code !==
            "SQLITE_CONSTRAINT_PRIMARYKEY"
        )
            throw err;

        if (tries > 0) return create(knex, tries - 1);
        throw new Error("Failed to generate unique sessionID");
    }

    return session;
}

async function load(knex: Knex, id: string): Promise<ISessionModel> {
    const session = await knex("sessions").first().where({ id });

    // if session was not found, create a new one
    if (!session) return create(knex);

    return {
        id,
        userSignature: session.userSignature
            ? (JSON.parse(session.userSignature) as IUserSignature)
            : null,
    };
}

/** authenticates client and provides session object */
export default async function init(
    knex: Knex,
    request: WithCookieStore<Request>
): Promise<ISessionModel> {
    const sessionID = await request.cookieStore.get("sessionID");
    const session = sessionID
        ? await load(knex, sessionID.value)
        : await create(knex);

    await request.cookieStore.set({
        httpOnly: true,
        // secure: process.env.NODE_ENV === "production",
        secure: false,
        expires: addMonths(new Date(), 6),
        name: "sessionID",
        value: session.id,
        domain: null,
    });

    return session;
}
