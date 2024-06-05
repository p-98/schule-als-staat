import type { IAppContext } from "Server";

import { assert } from "Util/error";
import type { ISessionModel, TUserModel } from "Types/models";
import bcrypt from "bcrypt";
import { TNullable } from "Types";
import { parseUserSignature, stringifyUserSignature } from "Util/parse";
import { TCredentialsInput } from "Types/schema";
import { assertCredentials } from "Util/auth";
import { omit } from "lodash/fp";

export async function checkPassword(
    userModel: TUserModel,
    password: TNullable<string>
): Promise<boolean> {
    if (userModel.type === "GUEST") return true;
    if (password === null) return false;

    return bcrypt.compare(password, userModel.password);
}

export async function login(
    ctx: IAppContext,
    credentials: TCredentialsInput
): Promise<ISessionModel> {
    const { knex, session } = ctx;
    await assertCredentials(ctx, credentials);

    const [success] = await knex("sessions")
        .update({
            userSignature: stringifyUserSignature(credentials),
        })
        .where({ id: session.id })
        .returning("*");
    assert(
        !!success,
        `Session with id ${session.id} not found`,
        "SESSION_NOT_FOUND"
    );
    session.userSignature = omit("password", credentials);

    return {
        ...success,
        userSignature: parseUserSignature(success.userSignature!),
    };
}

export async function logout(
    ctx: IAppContext,
    id: string
): Promise<ISessionModel> {
    const { knex, session } = ctx;

    const [success] = await knex("sessions")
        .update({ userSignature: null })
        .where({ id })
        .returning("*");
    assert(!!success, `Session with id ${id} not found`, "SESSION_NOT_FOUND");
    session.userSignature = null;

    return {
        ...success,
        userSignature: null,
    };
}
