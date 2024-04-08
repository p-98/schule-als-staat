import type { RequestListener } from "http";

import { createServer } from "http";

import { yogaFactory } from "Server";
import { loadKnex } from "Database";
import config from "Config";

const { port, host } = config.server;

const knex = await loadKnex();
const yoga = yogaFactory(knex);
const server = createServer(yoga as unknown as RequestListener);
server.listen(port, host, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running at ${host}:${port}`);
});
