import { ITransaction } from "Utility/types";

const transactions: ITransaction[] = [
    {
        id: "1",
        type: "transfer",
        date: "21.06.2021 9:14",
        purpose: "Essensvorschuss",
        receiver: "Andere Person",
        sender: "Max Mustermann",
        value: -10.0,
    },
    {
        id: "2",
        type: "transfer",
        date: "21.06.2021 9:14",
        purpose: "Geld von vorhin",
        receiver: "Max Mustermann",
        sender: "Andere Person",
        value: 10.0,
    },
    {
        id: "3",
        type: "change",
        date: "21.06.2021 9:14",
        baseCurrency: "real",
        baseValue: 10,
        targetCurrency: "virtual",
        targetValue: 31.41,
    },
    {
        id: "4",
        type: "purchase",
        date: "21.06.2021 9:14",
        vendor: "Donuts Inc Ltd.",
        customer: "Max Mustermann",
        goods: "2x Bacon",
        price: 6.282,
        // display as vendor
        includedTax: 0.282,
    },
    {
        id: "5",
        type: "purchase",
        date: "21.06.2021 9:14",
        vendor: "Donuts Inc Ltd.",
        customer: "Max Mustermann",
        goods: "1x Bacon",
        price: 3.141,
    },
    {
        id: "6",
        type: "purchase",
        date: "21.06.2021 9:14",
        vendor: "Warenlager",
        customer: "Max Mustermann",
        goods: "10x Bacon",
        price: 10.345,
        additionalInfo: "Bestellung für 13.08.",
    },
    {
        id: "7",
        type: "purchase",
        date: "21.06.2021 9:14",
        vendor: "Warenlager",
        customer: "Max Mustermann",
        goods: "5x Bacon",
        price: 5.549,
        additionalInfo: "Sofortkauf",
    },
];

function repeatArr<T>(arr: T[], times: number): T[] {
    if (times === 1) return arr;

    return arr.concat(repeatArr(arr, times - 1));
}
function reassignIDs(arr: ITransaction[]): ITransaction[] {
    return arr.map((transaction, index) => ({
        ...transaction,
        id: index.toString(),
    }));
}
export default reassignIDs(repeatArr(transactions, 5));
