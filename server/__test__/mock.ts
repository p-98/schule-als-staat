import { afterEach, jest } from "@jest/globals";
import { join } from "path";
import * as misc from "Util/misc";
import * as _database from "Server/database/_database";

export const mocks = {
    _backup: jest.fn<typeof _database._backup>(),
};

jest.mock("fs/promises");
jest.mock("Util/misc", () => ({
    __esModule: true,
    ...jest.requireActual<typeof misc>("Util/misc"),
    resolveRoot: join,
}));
jest.mock("Server/database/_database", () => ({
    __esModule: true,
    ...jest.requireActual<typeof _database>("Server/database/_database"),
    _backup: mocks._backup,
}));

afterEach(() => {
    jest.clearAllMocks();
});
