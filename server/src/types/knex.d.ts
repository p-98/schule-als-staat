import { Knex } from "knex";
import type { TNullable } from "Types";

type TNullableToOptional<T extends Record<PropertyKey, unknown>> = {
    [K in keyof T]: null extends T[K] ? T[K] | undefined : T[K];
};

// like Omit, but with typed keys
type TOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ISession {
    id: string;
    userSignature: TNullable<string>;
}

export interface IBankAccount {
    id: string;
    balance: number;
    redemptionBalance: number;
}

export interface IGuest {
    id: string;
    bankAccountId: string;
    name: TNullable<string>;
    enteredAt: string;
    leftAt: TNullable<string>;
}

export interface ICitizen {
    id: string;
    bankAccountId: string;
    firstName: string;
    lastName: string;
    password: string;
    image: string;
    /** The class if the citizen is a student, null otherwise */
    class: TNullable<string>;
}

export interface ICompany {
    id: string;
    bankAccountId: string;
    name: string;
    password: string;
    image: string;
}

export interface IEmployment {
    id: number;
    companyId: string;
    citizenId: string;
    salary: number;
    minWorktime: number;
    employer: boolean;
    cancelled: boolean;
}

export interface IWorktime {
    id: number;
    employmentId: number;
    start: string;
    end: TNullable<string>; // null during the working session is ongoing
}

export interface IEmploymentOffer {
    id: number;
    companyId: string;
    citizenId: string;
    state: "PENDING" | "REJECTED" | "ACCEPTED" | "DELETED";
    rejectionReason: TNullable<string>;
    salary: number;
    minWorktime: number;
}

export interface ITransferTransaction {
    id: number;
    date: string;
    senderUserSignature: string;
    receiverUserSignature: string;
    value: number;
    purpose: TNullable<string>;
}

export interface IChangeTransaction {
    id: number;
    date: string;
    // null => draft (not paid); not null => transaction (paid)
    userSignature: TNullable<string>;
    fromCurrency: string;
    fromValue: number;
    toCurrency: string;
    toValue: number;
    clerkCitizenId: TNullable<string>;
}

export interface IPurchaseTransaction {
    id: number;
    date: string;
    customerUserSignature: TNullable<string>;
    companyId: string;
    grossPrice: number;
    tax: number;
    discount: TNullable<number>;
}

export interface IProductSale {
    purchaseId: number;
    productId: string;
    productRevision: string;
    amount: number;
}

export interface ICustomsTransaction {
    id: number;
    date: string;
    userSignature: string;
    customs: number;
}

export interface ISalaryTransaction {
    id: number;
    date: string;
    employmentId: number;
    grossValue: number;
    tax: number;
    worktimeId: TNullable<number>;
}

export interface IProduct {
    id: string;
    revision: string;
    companyId: string;
    name: string;
    price: number;
    deleted: boolean;
}

export interface IVote {
    id: string;
    type: "CONSENSUS" | "RADIO";
    title: string;
    description: string;
    image: string;
    endAt: string;
    choices: string;
    result: TNullable<string>;
    chartInfo: TNullable<string>;
}

export interface IVotingPaper {
    voteId: string;
    citizenId: string;
    vote: string;
}

export interface IStay {
    id: number;
    citizenId: string;
    enteredAt: string;
    leftAt: TNullable<string>;
}

export interface IWarehouseOrder {
    purchaseId: number;
}

export interface ICard {
    id: string;
    userSignature: TNullable<string>;
    blocked: boolean;
}

export type ICertificate = {
    id: Buffer;
    issuerUserSignature: string;
};

declare module "knex/types/tables" {
    interface Tables {
        sessions: Knex.CompositeTableType<
            ISession,
            TNullableToOptional<ISession>,
            TNullableToOptional<TOmit<ISession, "id">>
        >;
        bankAccounts: Knex.CompositeTableType<
            IBankAccount,
            IBankAccount,
            Partial<TOmit<IBankAccount, "id">>
        >;
        guests: Knex.CompositeTableType<
            IGuest,
            TNullableToOptional<TOmit<IGuest, "leftAt">>,
            Partial<Pick<IGuest, "leftAt">>
        >;
        citizens: Knex.CompositeTableType<
            ICitizen,
            ICitizen,
            Partial<Pick<ICitizen, "image" | "password">>
        >;
        companies: Knex.CompositeTableType<
            ICompany,
            ICompany,
            Partial<Pick<ICompany, "image" | "password">>
        >;
        worktimes: Knex.CompositeTableType<
            IWorktime,
            TOmit<IWorktime, "id" | "end">,
            Partial<Pick<IWorktime, "end">>
        >;
        employments: Knex.CompositeTableType<
            IEmployment,
            TOmit<IEmployment, "id">,
            Partial<Pick<IEmployment, "cancelled">>
        >;
        employmentOffers: Knex.CompositeTableType<
            IEmploymentOffer,
            TOmit<IEmploymentOffer, "id" | "rejectionReason">,
            Partial<Pick<IEmploymentOffer, "state" | "rejectionReason">>
        >;
        transferTransactions: Knex.CompositeTableType<
            ITransferTransaction,
            TNullableToOptional<Omit<ITransferTransaction, "id">>,
            never
        >;
        changeTransactions: Knex.CompositeTableType<
            IChangeTransaction,
            TOmit<IChangeTransaction, "id" | "userSignature">,
            Pick<IChangeTransaction, "userSignature">
        >;
        purchaseTransactions: Knex.CompositeTableType<
            IPurchaseTransaction,
            Omit<IPurchaseTransaction, "id" | "customerUserSignature">,
            Pick<IPurchaseTransaction, "customerUserSignature">
        >;
        productSales: Knex.CompositeTableType<
            IProductSale,
            IProductSale,
            never
        >;
        customsTransactions: Knex.CompositeTableType<
            ICustomsTransaction,
            Omit<ICustomsTransaction, "id">,
            never
        >;
        salaryTransactions: Knex.CompositeTableType<
            ISalaryTransaction,
            TNullableToOptional<Omit<ISalaryTransaction, "id">>,
            never
        >;
        products: Knex.CompositeTableType<
            IProduct,
            IProduct,
            Pick<IProduct, "deleted">
        >;
        votes: Knex.CompositeTableType<
            IVote,
            TOmit<IVote, "result" | "chartInfo">,
            Partial<Pick<IVote, "result" | "chartInfo">>
        >;
        votingPapers: Knex.CompositeTableType<
            IVotingPaper,
            IVotingPaper,
            never
        >;
        stays: Knex.CompositeTableType<
            IStay,
            Omit<IStay, "id" | "leftAt">,
            Partial<Pick<IStay, "leftAt">>
        >;
        warehouseOrders: Knex.CompositeTableType<
            IWarehouseOrder,
            IWarehouseOrder,
            never
        >;
        cards: Knex.CompositeTableType<
            ICard,
            Pick<ICard, "id" | "blocked">,
            Partial<TOmit<ICard, "id">>
        >;
        certificates: Knex.CompositeTableType<
            ICertificate,
            ICertificate,
            never
        >;
    }
}

declare module "knex/types/result" {
    interface Registry {
        Count: number;
    }
}
