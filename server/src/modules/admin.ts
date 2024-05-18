import { backup } from "Database";
import { type IAppContext } from "Server";
import { assertRole } from "Util/auth";
import { assert, fail, hasCode } from "Util/error";

export function backupDatabase(ctx: IAppContext): Promise<void> {
    const { db, config, session } = ctx;
    assertRole(session.userSignature, "ADMIN");
    return backup(db, config);
}

export async function execDatabase(
    ctx: IAppContext,
    sql: string
): Promise<object> {
    const { db, knex, config, session } = ctx;
    assertRole(session.userSignature, "ADMIN");
    assert(
        config.database.allowRawSql,
        "Configuration database.allowRawSql not set.",
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
    assertRole(session.userSignature, "ADMIN");
    await backup(db, config);
    await config.reload();
}
