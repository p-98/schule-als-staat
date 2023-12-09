import type { IAppContext } from "Server";

import { assert } from "Util/error";
import type { TUserModel } from "Types/models";
import bcrypt from "bcrypt";
import { TNullable } from "Types";
import { stringifyUserSignature } from "Util/parse";
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
): Promise<TUserModel> {
    const { knex, session } = ctx;
    const user = await assertCredentials(ctx, credentials);

    const success = await knex("sessions")
        .update({
            userSignature: stringifyUserSignature(credentials),
        })
        .where({ id: session.id });
    assert(
        success === 1,
        `Session with id ${session.id} not found`,
        "SESSION_NOT_FOUND"
    );
    session.userSignature = omit("password", credentials);

    return user;
}

export async function logout(
    { knex, session }: IAppContext,
    id: string
): Promise<void> {
    const success = await knex("sessions")
        .update({ userSignature: null })
        .where({ id });
    assert(
        success === 1,
        `Session with id ${id} not found`,
        "SESSION_NOT_FOUND"
    );
    // eslint-disable-next-line no-param-reassign
    session.userSignature = null;
}
