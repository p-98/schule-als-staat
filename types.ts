import { ThemePropT } from "@rmwc/types";
import config from "./config";

// general types
/** unix timestamp or iso string? */
type TTimestamp = Date;

// vote types
export interface IVoteBase {
    id: string;
    title: string;
    description: string;
    image: string;
    end: Date;
    items: string[];
    result?: number[];
    chartInfo?: Record<string, unknown>;
}
export interface IVoteConsensus extends IVoteBase {
    type: "consensus";
    vote?: number[];
}
export interface IVoteRadio extends IVoteBase {
    type: "radio";
    vote?: number;
}
export type TVote = IVoteConsensus | IVoteRadio;

export type TVoteWithResult<Vote extends TVote = TVote> = Vote & {
    result: NonNullable<Vote["result"]>;
};
export type IVoteWithChartInfo<
    Vote extends TVote,
    ChartName extends string,
    ChartInfo = unknown
> = Vote & {
    chartInfo: Record<ChartName, ChartInfo>;
};

export type TWithVoteProp<Vote extends TVote = TVote, T = unknown> = T & {
    vote: Vote;
};

// border control types
export interface IBorderCrossing {
    action: "enter" | "leave";
    timestamp: TTimestamp;
    customsTransaction?: ICustomsTransaction;
}

// product types
/** Default resolution is one hour */
export interface IProductStatsExtract {
    sales: number;
    netRevenue: number;
    grossRevenue: number;
    startTime: TTimestamp;
}
export interface IProduct {
    id: string;
    name: string;
    price: number;
    todaySales: number;
    totalGrossRevenue: number;
    totalSales: number;
    totalSalesPerDay: number;
    stats: IProductStatsExtract[];
}

// bank types
export interface IBankAccount {
    id: string;
    balance: number;
    /** amount of virtual money that can be changed back to real money */
    redemptionBalance: number;
    transactions: ITransaction[];
}

// company types
export interface IEmploymentInfo {
    company: ICompanyUser;
    employee: ICitizenUser;
    /** virtual currency per hour */
    salary: number;
    /** working hours as per day */
    hours: number;

    /** undefined if citizen is not currently working */
    activeSince: undefined | TTimestamp;
    worktimeToday: number;
    worktimeYesterday: number;
}

/** Default resolution is one hour */
export interface IFinancesExtract {
    staff: number;
    netRevenue: number;
    profit: number;
    startTime: TTimestamp;
}

// user types
interface IBaseUser {
    // four hexadecimal characters
    id: string;
    bankAccount: IBankAccount;
}
export interface IGuestUser extends IBaseUser {
    type: "guest";
    enter: TTimestamp;
    leave: TTimestamp;
}
export interface ICitizenUser extends IBaseUser {
    type: "citizen";
    firstName: string;
    lastName: string;
    name: string;
    image: string;
    employment?: IEmploymentInfo;
}
export interface ICompanyUser extends IBaseUser {
    type: "company";
    name: string;
    employer: IEmploymentInfo;
    employees: IEmploymentInfo[];
    products: IProduct[];
    image: string;
    finances: IFinancesExtract[];
}
export type TUser = IGuestUser | ICitizenUser | ICompanyUser;

export type TUserSignature = Pick<TUser, "type" | "id">;

export type TQrToUser = (qr: string) => TUser;

// transaction types
interface IBaseTransaction {
    date: string;
    id: string;
}
export interface ITransferTransaction extends IBaseTransaction {
    type: "transfer";
    sender: ICitizenUser | IGuestUser;
    receiver: ICitizenUser | IGuestUser;
    value: number;
    purpose: string;
}
export interface IChangeTransaction extends IBaseTransaction {
    type: "change";
    user: ICitizenUser | IGuestUser;
    baseCurrency: keyof typeof config.currencies;
    baseValue: number;
    targetCurrency: keyof typeof config.currencies;
    targetValue: number;
}
export interface IPurchaseTransaction extends IBaseTransaction {
    type: "purchase";
    customer: TUser;
    vendor: ICompanyUser;
    grossPrice: number;
    netPrice: number;
    tax: number;
    items: [number, IProduct][];
    discount: number;
    additionalInfo?: string;
}
export interface ICustomsTransaction extends IBaseTransaction {
    type: "customs";
    user: ICompanyUser | ICitizenUser;
    customs: number;
}
export interface ISalaryTransaction extends IBaseTransaction {
    type: "salary";
    grossValue: number;
    netValue: number;
    tax: number;
    /** workStart and workEnd are either both timestamps or undefined. If they are undefined, it is a bonus payment */
    workStart: TTimestamp | undefined;
    /** workStart and workEnd are either both timestamps or undefined. If they are undefined, it is a bonus payment */
    workEnd: TTimestamp | undefined;
}
export type ITransaction =
    | ITransferTransaction
    | IChangeTransaction
    | IPurchaseTransaction
    | ICustomsTransaction
    | ISalaryTransaction;

// helper types
/** resolves to unknwon, if T = any, and never otherwise */
type TValidToNever<T> = T extends string
    ? T extends number
        ? unknown
        : never
    : never;
export type TIsAny<T> = [TValidToNever<T>] extends [never] ? false : true;

// types for rmwc wrappers
export type TWithThemeProp<T = unknown> = T & { theme?: ThemePropT };

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
