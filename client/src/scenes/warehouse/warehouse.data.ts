import { reassignIDs, repeatArr } from "Utility/dataMockup";

interface IWarehouseOrderFragment {
    id: string;
    dateFor: string;
    customer: {
        id: string;
        name: string;
    };
    product: {
        id: string;
        name: string;
    };
    quantity: number;
    collected: number;
}

const transactions: IWarehouseOrderFragment[] = [
    {
        id: "",
        dateFor: "2021-06-20",
        customer: { id: "", name: "Donuts Inc. Ltd." },
        product: { id: "1", name: "Getränk" },
        quantity: 10,
        collected: 0,
    },
    {
        id: "",
        dateFor: "2021-06-20",
        customer: { id: "", name: "Donuts Inc. Ltd." },
        product: { id: "2", name: "Milch" },
        quantity: 6,
        collected: 3,
    },
    {
        id: "",
        dateFor: "2021-06-20",
        customer: { id: "", name: "Donuts Inc. Ltd." },
        product: { id: "1", name: "Getränk" },
        quantity: 10,
        collected: 0,
    },
    {
        id: "",
        dateFor: "2021-05-20",
        customer: { id: "", name: "Donuts Inc. Ltd." },
        product: { id: "2", name: "Milch" },
        quantity: 10,
        collected: 0,
    },
    {
        id: "",
        dateFor: "2021-06-20",
        customer: { id: "", name: "Dönerbude & Co." },
        product: { id: "2", name: "Milch" },
        quantity: 10,
        collected: 0,
    },
];
export default reassignIDs(repeatArr(transactions, 5));
