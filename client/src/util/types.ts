import React from "react";
import { ThemePropT } from "Components/material/types";
import config from "Config";

export type TUser = string;

// helpter types

/** Opposite of NonNullable */
export type Nullable<T> = T | null | undefined;

// this type resolves to unknwon, if T = any, and never otherwise
type TValidToNever<T> = T extends string
    ? T extends number
        ? unknown
        : never
    : never;
export type TIsAny<T> = [TValidToNever<T>] extends [never] ? false : true;

export type LengthArray<
    T,
    N extends number,
    R extends T[] = []
> = number extends N
    ? T[]
    : R["length"] extends N
    ? R
    : LengthArray<T, N, [T, ...R]>;

export type ChangeEvent = React.ChangeEvent<HTMLInputElement>;

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
export interface IChangeTransaction extends ITransactionBase {
    type: "change";

    baseCurrency: keyof typeof config.currencies;
    baseValue: number;

    targetCurrency: keyof typeof config.currencies;
    targetValue: number;
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
    return typeof obj === "object" && obj !== null && key in obj;
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
