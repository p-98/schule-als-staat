import { backup } from "Database";
import { type IAppContext } from "Server";
import { assertRole, checkRole, encryptPassword } from "Util/auth";
import { assert, fail, hasCode, userStr } from "Util/error";
import { type TUserSignatureInput } from "Types/schema";
import { type TUserModel } from "Types/models";
import { EUserTypeTableMap, stringifyUserSignature } from "Util/parse";
import { getUser } from "./users";

export function backupDatabase(ctx: IAppContext): Promise<void> {
    const { db, config, session } = ctx;
    assertRole(ctx, session.userSignature, "ADMIN");
    return backup(db, config);
}

export async function execDatabase(
    ctx: IAppContext,
    sql: string
): Promise<object> {
    const { db, knex, config, session } = ctx;
    assertRole(ctx, session.userSignature, "ADMIN");
    assert(
        config.database.allowRawSql,
        "Konfiguration database.allowRawSql nicht gesetzt.",
        "RESTRICTION_ALLOW_RAW_SQL"
    );
    await backup(db, config);
    try {
        return await knex.raw(sql);
    } catch (err) {
        if (!(err instanceof Error) || !hasCode(err)) throw err;
        fail(err.message, err.code);
    }
}

export async function reloadConfig(ctx: IAppContext): Promise<void> {
    const { db, config, session } = ctx;
    assertRole(ctx, session.userSignature, "ADMIN");
    await backup(db, config);
    await config.reload();
}

export function resetPassword(
    ctx: IAppContext,
    user: TUserSignatureInput,
    password: string
): Promise<TUserModel> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "ADMIN");
    assert(
        checkRole(ctx, user, "CITIZEN") || checkRole(ctx, user, "COMPANY"),
        "Benutzer ist ein Gast und Gäste haben kein Passwort.",
        "USER_IS_GUEST"
    );
    return knex.transaction(async (trx) => {
        const updates = await trx(EUserTypeTableMap[user.type])
            .update({ password: await encryptPassword(password) })
            .where({ id: user.id })
            .returning("id");
        assert(
            updates.length > 0,
            `${userStr(user)} nicht gefunden.`,
            "USER_NOT_FOUND"
        );
        // logout all clients logged in with this user
        await trx("sessions")
            .update({ userSignature: null })
            .where({ userSignature: stringifyUserSignature(user) });
        return getUser({ ...ctx, knex: trx }, user);
    });
}
