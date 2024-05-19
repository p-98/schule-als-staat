import { TypedEventTarget } from "typescript-event-target";
import createJITI from "jiti";

import { type Config } from "Root/types/config";
import { type IDynamicConfig } from "Server";
import { inOperator } from "Types";
import { fail } from "Util/error";
import { resolveRoot, CustomEvent } from "Util/misc";

const jiti = createJITI(__filename, { requireCache: false });

function isError(err: unknown): err is { message: string } {
    return (
        typeof err === "object" &&
        inOperator("message", err) &&
        typeof err.message === "string"
    );
}

async function loadFile(path: string): Promise<object> {
    try {
        return jiti.import(path, {}) as object;
    } catch (err) {
        if (isError(err) && err.message.startsWith("Cannot find module"))
            fail("File config.ts not found.", "CONFIG_NOT_FOUND");
        throw err;
    }
}

async function loadConfigFile(): Promise<Config> {
    const path = resolveRoot("config.ts");
    const module = await loadFile(path);
    if (!inOperator("default", module))
        fail(
            "File config.ts must have config as default export.",
            "CONFIG_MISSING_EXPORT"
        );
    if (typeof module.default !== "object" || module.default === null)
        fail(
            "File config.ts default export must be an config object.",
            "CONFIG_INVALID_EXPORT"
        );
    return module.default as Config;
}

/** Config loaded from config file
 *
 * Dispatched events: "reloaded"
 */
export class FileConfig
    extends TypedEventTarget<{
        reload: CustomEvent<Config>;
    }>
    implements IDynamicConfig
{
    private config: Promise<Config>;

    constructor() {
        super();
        this.config = loadConfigFile();
    }

    async get(): Promise<Config> {
        return this.config;
    }

    async reload(): Promise<void> {
        this.config = loadConfigFile();
        this.dispatchTypedEvent(
            "reload",
            new CustomEvent<Config>("reload", { detail: await this.config })
        );
    }
}
