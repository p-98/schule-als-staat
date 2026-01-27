import { afterEach, mock } from "bun:test";
import { join } from "path";
import * as _database from "Server/database/_database";

export const mocks = {
    _backup: mock<typeof _database._backup>(),
};

await mock.module("Util/misc", () => ({
    resolveRoot: join,
}));
await mock.module("Server/database/_database", () => ({
    _backup: mocks._backup,
}));

afterEach(() => {
    mock.restore();
});
