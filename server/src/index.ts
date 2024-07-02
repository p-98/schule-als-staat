import { type RequestListener, createServer } from "http";
import exitHook from "async-exit-hook";
import { entries, mapValues } from "lodash/fp";
import { type DocumentNode, parse } from "graphql";

import { type Config } from "Root/types/config";
import { yogaFactory } from "Server";
import { backup, Db, loadKnex } from "Database";
import { FileConfig } from "Util/config";
import { pipe1, syncifyF } from "Util/misc";
import persistedDocumentsJson from "Util/graphql/persisted-documents.json";

const periodicBackups = (() => {
    let backupInterval: NodeJS.Timer;
    return {
        restart(db: Db, config: Config) {
            clearInterval(backupInterval);
            backupInterval = setInterval(
                syncifyF(async () => backup(db, config)),
                config.database.backup.interval
            );
        },
    };
})();

const config = new FileConfig();
const _config = await config.get();

const operations = pipe1(
    persistedDocumentsJson,
    mapValues(parse),
    entries<DocumentNode>,
    (e) => new Map(e)
);

const [db, knex] = await loadKnex(_config);
exitHook((done) =>
    syncifyF(async () => {
        await knex.destroy();
        done();
    })()
);

await backup(db, _config);
periodicBackups.restart(db, await config.get());
config.addEventListener("reload", (e) => {
    periodicBackups.restart(db, e.detail);
});

const yoga = yogaFactory(db, knex, operations, config);
const server = createServer(yoga as unknown as RequestListener);
const { port, host } = _config.server;
server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at ${host}:${port}`);
});
