import { backup } from "Database";
import { type IAppContext } from "Server";
import { assertRole } from "Util/auth";

export function backupDatabase(ctx: IAppContext): Promise<void> {
    const { db, config, session } = ctx;
    assertRole(session.userSignature, "ADMIN");
    return backup(db, config);
}

export async function reloadConfig(ctx: IAppContext): Promise<void> {
    const { db, config, session } = ctx;
    assertRole(session.userSignature, "ADMIN");
    await backup(db, config);
    await config.reload();
}
