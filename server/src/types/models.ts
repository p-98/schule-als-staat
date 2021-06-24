import type Library from "@api/library";

export interface IBookModel {
    title: string;
    author: string;
}

export interface IAuthorModel {
    name: string;
}

export interface IContext {
    dataSources: { Library: typeof Library };
}

export const enum ESubscriptionEvents {
    ADDED_BOOK = "ADDED_BOOK",
}
