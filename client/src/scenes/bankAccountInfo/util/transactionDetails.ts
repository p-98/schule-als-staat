import config from "Config";
import {
    IChangeTransaction,
    IPurchaseTransaction,
    ITransaction,
    ITransferTransaction,
} from "Utility/types";
import type { TTransactionDetails } from "../components/transactions";
import { parseCurrency } from "./parseCurrency";

const generatorMap = {
    transfer: (transaction: ITransferTransaction) => ({
        Zeitpunkt: transaction.date,
        Transaktionsart: "Überweisung",
        Betrag: parseCurrency(transaction.value),
        Sender: transaction.sender,
        Empfänger: transaction.receiver,
        Verwendungszweck: transaction.purpose,
    }),
    change: (transaction: IChangeTransaction) => ({
        Zeitpunkt: transaction.date,
        Transaktionsart: "Wechsel",
        Bezahlt: parseCurrency(transaction.baseValue, transaction.baseCurrency),
        Erhalten: parseCurrency(
            transaction.targetValue,
            transaction.targetCurrency
        ),
    }),
    purchase: ({
        customer,
        date,
        includedTax,
        goods,
        price,
        vendor,
        additionalInfo,
    }: IPurchaseTransaction) => {
        const displayAsVendor = typeof includedTax !== "undefined";

        const transactionDetails: TTransactionDetails = {
            Transaktionsart: "Kauf",
            Datum: date,
            Preis: parseCurrency(price),
            ...(displayAsVendor && {
                "Abgängige Steuern": parseCurrency(includedTax),
            }),
            Waren: goods,
        };

        if (displayAsVendor) transactionDetails.Kunde = customer;
        else transactionDetails.Unternehmen = vendor;

        if (additionalInfo !== undefined)
            transactionDetails["Zusätzliche Informationen"] = additionalInfo;

        return transactionDetails;
    },
};

export function generateTransactionDetails(
    transaction: ITransaction
): TTransactionDetails {
    // @ts-expect-error typescript is not able to see that this passes the correct parameter to each function
    return generatorMap[transaction.type](transaction);
}
