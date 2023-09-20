import type { CookieStore } from "@whatwg-node/cookie-store";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };

export type UnPromise<P> = P extends Promise<infer T> ? T : never;
