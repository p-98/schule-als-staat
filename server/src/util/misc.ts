import type { CookieStore } from "@whatwg-node/cookie-store";

import path from "node:path";
import { root } from "Config";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };

export type UnPromise<P> = P extends Promise<infer T> ? T : never;

/** Function resolving paths relative to global config file */
export const resolveRoot = (...pathSegments: string[]): string =>
    path.resolve(root, ...pathSegments);
