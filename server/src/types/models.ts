import type { TNullable } from "Types";
import type { TBorderCrossingAction } from "./schema";

export interface IBookModel {
    title: string;
    author: string;
}

export interface IAuthorModel {
    name: string;
}

export interface ISessionModel {
    id: string;
    userSignature: TNullable<IUserSignature>;
    /** cache for fetched user model */
    $user?: Promise<TUserModel>;
}

export type TUserType = "COMPANY" | "CITIZEN" | "GUEST";
// maps the UserType enum to the object type names
export enum EUserTypes {
    GUEST = "GuestUser",
    CITIZEN = "CitizenUser",
    COMPANY = "CompanyUser",
}
export interface IUserSignature {
    type: TUserType;
    id: string;
}

interface TUserBaseModel {
    type: TUserType;
    id: string;
    bankAccountId: string;
    balance: number;
    redemptionBalance: number;
}

export interface IGuestUserModel extends TUserBaseModel {
    type: "GUEST";
    name: TNullable<string>;
    enteredAt: string;
    leftAt: TNullable<Date>;
}

export interface ICitizenUserModel extends TUserBaseModel {
    type: "CITIZEN";
    firstName: string;
    lastName: string;
    password: string;
    image: string;
}
export interface ICompanyUserModel extends TUserBaseModel {
    type: "COMPANY";
    name: string;
    password: string;
    image: string;
}

export type TUserModel =
    | IGuestUserModel
    | ICitizenUserModel
    | ICompanyUserModel;

export interface ICompanyStatsFragmentModel {
    startOfHour: string;
    staff: number;
    staffCost: number;
    grossRevenue: number;
    netRevenue: number;
    profit: number;
}

export interface IWorktimeModel {
    id: number;
    employmentId: number;
    start: string;
    end: TNullable<string>;
}

export interface IEmploymentModel {
    id: number;
    companyId: string;
    citizenId: string;
    salary: number;
    minWorktime: number;
    cancelled: boolean;
}

export interface IEmploymentOfferModel {
    id: number;
    companyId: string;
    citizenId: string;
    state: "PENDING" | "REJECTED" | "ACCEPTED" | "DELETED";
    rejectionReason: TNullable<string>;
    salary: number;
    minWorktime: number;
}

export type TTransactionType =
    | "TRANSFER"
    | "CHANGE"
    | "PURCHASE"
    | "CUSTOMS"
    | "SALARY";
// maps the TransactionType enum to the object type names
export enum ETransactionTypes {
    TRANSFER = "TransferTransaction",
    CHANGE = "ChangeTransaction",
    PURCHASE = "PurchaseTransaction",
    CUSTOMS = "CustomsTransaction",
    SALARY = "SalaryTransaction",
}
// maps the TransactionType enum to the draft object type names
export enum EDraftTypes {
    CHANGE = "ChangeDraft",
    PURCHASE = "PurchaseDraft",
}

interface ITransactionBaseModel {
    type: TTransactionType;
    id: number;
    date: string;
}

export interface ITransferTransactionModel extends ITransactionBaseModel {
    type: "TRANSFER";
    senderUserSignature: IUserSignature;
    receiverUserSignature: IUserSignature;
    value: number;
    purpose: TNullable<string>;
}

export interface IChangeTransactionModel extends ITransactionBaseModel {
    type: "CHANGE";
    userSignature: IUserSignature;
    action: "VIRTUAL_TO_REAL" | "REAL_TO_VIRTUAL";
    valueVirtual: number;
    valueReal: number;
}
export type IChangeDraftModel = Omit<IChangeTransactionModel, "userSignature">;

export interface IPurchaseTransactionModel extends ITransactionBaseModel {
    type: "PURCHASE";
    customerUserSignature: IUserSignature;
    companyId: string;
    grossPrice: number;
    tax: number;
    discount: TNullable<number>;
}
export type IPurchaseDraftModel = Omit<
    IPurchaseTransactionModel,
    "customerUserSignature"
>;

export interface IPurchaseItemModel {
    productId: string;
    productRevision: string;
    amount: number;
}

export interface ICustomsTransactionModel extends ITransactionBaseModel {
    type: "CUSTOMS";
    userSignature: IUserSignature;
    customs: number;
}

export interface ISalaryTransactionModel extends ITransactionBaseModel {
    type: "SALARY";
    employmentId: number;
    grossValue: number;
    tax: number;
    worktimeId: TNullable<number>;
}

export type TTransactionModel =
    | ITransferTransactionModel
    | IChangeTransactionModel
    | IPurchaseTransactionModel
    | ICustomsTransactionModel
    | ISalaryTransactionModel;
export type TDraftModel = IChangeDraftModel | IPurchaseDraftModel;

export interface IBorderCrossingModel {
    citizenId: string;
    action: TBorderCrossingAction;
    date: string;
}

export interface IProductModel {
    id: string;
    revision: string;
    companyId: string;
    name: string;
    price: number;
    deleted: boolean;
}

export interface IProductStatsFragmentModel {
    sales: number;
    grossRevenue: number;
    startOfHour: string;
}

export interface IVoteModel {
    id: string;
    type: "CONSENSUS" | "RADIO";
    title: string;
    description: string;
    image: string;
    endAt: string;
    choices: string[];
    votingPaper: TNullable<number[]>;
    result: TNullable<number[]>;
    chartInfo: TNullable<string>;
}

export interface ICardModel {
    id: string;
    userSignature: TNullable<IUserSignature>;
    blocked: boolean;
}

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
