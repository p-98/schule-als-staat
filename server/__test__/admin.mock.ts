import { jest } from "@jest/globals";
import { join } from "path";
import * as misc from "Util/misc";

jest.mock("fs/promises");
jest.mock("Util/misc", () => ({
    __esModule: true,
    ...jest.requireActual<typeof misc>("Util/misc"),
    resolveRoot: join,
}));
