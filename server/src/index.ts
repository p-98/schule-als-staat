import type { RequestListener } from "http";

import { createServer } from "http";

import { yogaFactory } from "Server";
import { loadKnex } from "Database";

const host = "127.0.0.1";
const port = 4000;

const knex = loadKnex();
const yoga = yogaFactory(knex);
const server = createServer((yoga as unknown) as RequestListener);
server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at ${host}:${port}`);
});
