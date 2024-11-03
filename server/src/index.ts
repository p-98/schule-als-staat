import { type RequestListener, createServer } from "http";
import exitHook from "async-exit-hook";

import { yogaFactory } from "Server";
import { backup, loadKnex, type Knex } from "Database";
import { FileConfig } from "Util/config";
import { syncifyF } from "Util/misc";
import { type Config } from "Types/config";

const periodicBackups = (() => {
    let backupInterval: Timer;
    return {
        restart(knex: Knex, config: Config) {
            clearInterval(backupInterval);
            backupInterval = setInterval(
                syncifyF(async () => backup(knex, config)),
                config.database.backup.interval
            );
        },
    };
})();

const config = new FileConfig();
const _config = await config.get();

const [, knex] = await loadKnex(_config);
exitHook((done) =>
    syncifyF(async () => {
        await knex.destroy();
        done();
    })()
);

await backup(knex, _config);
periodicBackups.restart(knex, await config.get());
config.addEventListener("reload", (e) => {
    periodicBackups.restart(knex, e.detail);
});

const yoga = yogaFactory(knex, config);
const server = createServer(yoga as unknown as RequestListener);
const { port, host } = _config.server;
server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at ${host}:${port}`);
});
