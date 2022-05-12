import { Knex } from "knex";

type TNullable<T> = T | null;

type TNullableToOptional<T extends Record<PropertyKey, unknown>> = {
    [K in keyof T]: null extends T[K] ? T[K] | undefined : T[K];
};

// like Omit, but with typed keys
type TOmit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

export interface ISession {
    id: string;
    user: TNullable<string>;
}

export interface IBankAccount {
    id: string;
    balance: number;
    redemption_balance: number;
}

export interface IGuest {
    id: string;
    bank_account: string;
    name: TNullable<string>;
    entered_at: string;
    left_at: TNullable<string>;
}

export interface ICitizen {
    id: string;
    bank_account: string;
    first_name: string;
    last_name: string;
    image: string;
}

export interface ICompany {
    id: string;
    bank_account: string;
    name: string;
    image: string;
}

export interface IEmployment {
    company_id: string;
    employee_id: string;
    active_since: TNullable<string>;
    worktime: string;
    salary: number;
    hours: string;
    cancelled: TNullable<boolean>;
}

export interface IEmploymentOffer {
    company_id: string;
    employee_id: string;
    state: "PENDING" | "REJECTED";
    salary: number;
    hours: string;
}

export interface ITransferTransaction {
    id: number;
    date: string;
    sender_signature: string;
    receiver_signature: string;
    value: number;
    purpose: TNullable<string>;
}

export interface IChangeTransaction {
    id: number;
    date: string;
    user_signature: string;
    action: "VIRTUAL_TO_REAL" | "REAL_TO_VIRTUAL";
    value_virtual: number;
    value_real: number;
}

export interface IPurchaseTransaction {
    id: number;
    date: string;
    customer_signature: string;
    vendor_signature: string;
    gross_price: number;
    net_price: number;
    discount: TNullable<number>;
}

export interface ICustomsTransaction {
    id: number;
    date: string;
    user_signature: string;
    customs: number;
}

export interface ISalaryTransaction {
    id: number;
    date: string;
    employment_id: string;
    gross_value: number;
    net_value: number;
    work_start: TNullable<string>;
    work_end: TNullable<string>;
}

export interface IProduct {
    id: string;
    name: string;
    price: number;
}

export interface IProductSale {
    purchase_id: number;
    product_id: string;
    amount: number;
    gross_revenue: number;
}

export interface IVote {
    id: number;
    type: "CONSENSUS" | "RADIO";
    title: string;
    description: string;
    image: string;
    end_at: string;
    choices: string;
    result: TNullable<string>;
    chart_info: TNullable<string>;
}

export interface IVotingPaper {
    vote_id: number;
    citizen_id: string;
    vote: string;
}

declare module "knex/types/tables" {
    interface Tables {
        sessions: Knex.CompositeTableType<
            ISession,
            TNullableToOptional<ISession>,
            Partial<TOmit<ISession, "id">>
        >;
        bank_accounts: Knex.CompositeTableType<
            IBankAccount,
            IBankAccount,
            Partial<TOmit<IBankAccount, "id">>
        >;
        guests: Knex.CompositeTableType<
            IGuest,
            TNullableToOptional<TOmit<IGuest, "left_at">>,
            Partial<Pick<IGuest, "left_at">>
        >;
        citizens: Knex.CompositeTableType<
            ICitizen,
            ICitizen,
            Partial<Pick<ICitizen, "image">>
        >;
        companies: Knex.CompositeTableType<
            ICompany,
            ICompany,
            Partial<Pick<ICompany, "image">>
        >;
        employments: Knex.CompositeTableType<
            IEmployment,
            TOmit<IEmployment, "active_since" | "cancelled">,
            Partial<
                Pick<IEmployment, "active_since" | "worktime" | "cancelled">
            >
        >;
        employment_offers: Knex.CompositeTableType<
            IEmploymentOffer,
            IEmploymentOffer,
            never
        >;
        transfer_transactions: Knex.CompositeTableType<
            ITransferTransaction,
            TNullableToOptional<ITransferTransaction>,
            never
        >;
        change_transactions: Knex.CompositeTableType<
            IChangeTransaction,
            IChangeTransaction,
            never
        >;
        purchase_transactions: Knex.CompositeTableType<
            IPurchaseTransaction,
            IPurchaseTransaction,
            never
        >;
        customs_transactions: Knex.CompositeTableType<
            ICustomsTransaction,
            ICustomsTransaction,
            never
        >;
        salary_transactions: Knex.CompositeTableType<
            ISalaryTransaction,
            TNullableToOptional<ISalaryTransaction>,
            never
        >;
        products: Knex.CompositeTableType<
            IProduct,
            IProduct,
            Partial<TOmit<IProduct, "id">>
        >;
        product_sales: Knex.CompositeTableType<
            IProductSale,
            IProductSale,
            never
        >;
        votes: Knex.CompositeTableType<
            IVote,
            TOmit<IVote, "result" | "chart_info">,
            Partial<Pick<IVote, "result" | "chart_info">>
        >;
        voting_papers: Knex.CompositeTableType<
            IVotingPaper,
            IVotingPaper,
            never
        >;
    }
}
