import { ThemePropT } from "@rmwc/types";
import { IChangeCurrenciesInfo } from "Scenes/bank/types";

export type TUser = string;

// helpter types

// this type resolves to unknwon, if T = any, and never otherwise
type TValidToNever<T> = T extends string
    ? T extends number
        ? unknown
        : never
    : never;
export type TIsAny<T> = [TValidToNever<T>] extends [never] ? false : true;

// types for rmwc wrappers
export type TWithThemeProp<T = unknown> = T & { theme?: ThemePropT };

// transaction types
export interface ITransactionBase {
    date: string;
    id: string;
}
export interface ITransferTransaction extends ITransactionBase {
    type: "transfer";
    sender: string;
    receiver: string;
    value: number;
    purpose: string;
}
export interface IChangeTransaction
    extends ITransactionBase,
        IChangeCurrenciesInfo {
    type: "change";
}

export interface IPurchaseTransaction extends ITransactionBase {
    type: "purchase";
    customer: string;
    vendor: string;
    price: number;
    includedTax?: number;
    goods: string;
    additionalInfo?: string;
}
export type ITransaction =
    | ITransferTransaction
    | IChangeTransaction
    | IPurchaseTransaction;

// vote types
export interface IVoteCommon {
    id: string;
    title: string;
    description: string;
    icon: string;
    end: Date;
    items: string[];
    result?: number[];
    chartInfo?: Record<string, unknown>;
}
export interface IVoteConsensus extends IVoteCommon {
    type: "consensus";
    vote?: number[];
}
export interface IVoteRadio extends IVoteCommon {
    type: "radio";
    vote?: number;
}
export type IVote = IVoteConsensus | IVoteRadio;
export type IVoteWithResult = IVote & {
    result: number[];
};
export type IVoteWithChartInfo<
    Vote extends IVote,
    ChartName extends string,
    ChartInfo = unknown
> = Vote & {
    chartInfo: Record<ChartName, ChartInfo>;
};
export type TWithVoteProp<Vote extends IVote = IVote, T = unknown> = T & {
    vote: Vote;
};

// pos types
export interface IProduct {
    id: string;
    name: string;
    price: number;
}

// helper functions
export const isNumberArray = (arr: unknown): arr is number[] =>
    Array.isArray(arr) && arr.every((item) => typeof item === "number");

export const isStringArray = (arr: unknown): arr is string[] =>
    Array.isArray(arr) && arr.every((item) => typeof item === "string");

export const isObject = (obj: unknown): obj is Record<string, unknown> =>
    typeof obj === "object" && obj !== null;

export function inOperator<K extends PropertyKey, O>(
    key: K,
    obj: O
): obj is O & Record<K, unknown> {
    return key in obj;
}

export function checkPropertyType<K extends PropertyKey, O, T>(
    key: K,
    obj: O,
    isType: (toCheck: unknown) => toCheck is T
): obj is O & Record<K, T> {
    if (!inOperator(key, obj)) return false;

    if (!isType(obj[key])) return false;

    return true;
}
