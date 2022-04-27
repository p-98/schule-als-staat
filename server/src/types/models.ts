import type { YogaInitialContext } from "@graphql-yoga/node";
import type { IncomingMessage, ServerResponse } from "http";
import type { TCreateContext } from "../server";

type UnPromise<P> = P extends Promise<infer T> ? T : never;

export interface IBookModel {
    title: string;
    author: string;
}

export interface IAuthorModel {
    name: string;
}

// context types
export interface YogaServerContext {
    req: IncomingMessage;
    res: ServerResponse;
}

export type IContext = YogaInitialContext &
    YogaServerContext &
    UnPromise<ReturnType<TCreateContext>>;

// event types
export type TEvents = {
    ADDED_BOOK: [payload: IBookModel];
};

type TExtractPayload<T> = T extends [number | string, infer P1]
    ? P1
    : T extends [infer P2]
    ? P2
    : never;
export type TPayload<Event extends keyof TEvents> = TExtractPayload<
    TEvents[Event]
>;
