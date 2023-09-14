import type { CookieStore } from "@whatwg-node/cookie-store";

export type WithCookieStore<T> = T & { cookieStore: CookieStore };
