import { IChangeCurrenciesInfo } from "Scenes/bank/types";

export type TUser = string;

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
