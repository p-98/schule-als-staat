import {
    IChangeTransaction,
    IPurchaseTransaction,
    ITransaction,
    ITransferTransaction,
} from "Utility/types";
import config from "Config";
import type { ITransactionListItemInfo } from "../components/transactions";

// simulate logged in user
const currentUser = "Max Mustermann";

const generateWarehouseInfo = (transaction: IPurchaseTransaction) => {
    const { additionalInfo, price } = transaction;

    return {
        infoText: additionalInfo ?? "",
        type: "Warenlager",
        icon: "store",
        balance: -price,
    };
};

const generatorMap = {
    transfer: (transaction: ITransferTransaction) => {
        const { purpose, sender, value } = transaction;

        const outgoing = sender === currentUser;

        return {
            infoText: purpose,
            type: `${outgoing ? "Ausgehende" : "Eingehende"} Überweisung`,
            icon: outgoing ? "upload" : "download",
            balance: outgoing ? -value : value,
        };
    },
    change: (transaction: IChangeTransaction) => {
        const { baseCurrency, baseValue, targetValue } = transaction;

        const toVirtual = baseCurrency === "real";

        return {
            infoText: `${baseValue}${config.currencies[baseCurrency].symbol} in ${config.currencies[baseCurrency].short}`,
            type: "Wechsel",
            icon: "swap_horiz",
            balance: toVirtual ? targetValue : -baseValue,
        };
    },
    purchase: (transaction: IPurchaseTransaction) => {
        const { includedTax, customer, vendor, price } = transaction;

        if (vendor === "Warenlager") return generateWarehouseInfo(transaction);

        const displayAsVendor = includedTax !== undefined;

        return {
            infoText: displayAsVendor ? customer : vendor,
            type: displayAsVendor ? "Verkauf" : "Einkauf",
            icon: "shopping_cart",
            balance: displayAsVendor ? price - includedTax : -price,
        };
    },
};

export function generateListItemInfo(
    transaction: ITransaction
): ITransactionListItemInfo {
    // @ts-expect-error typescript is not able to see that this passes the correct parameter to each function
    return generatorMap[transaction.type](transaction);
}
