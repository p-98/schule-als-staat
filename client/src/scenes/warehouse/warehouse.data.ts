import { reassignIDs, repeatArr } from "Utility/dataMockup";

export interface IWarehouseOrderFragment {
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

const repeated = reassignIDs(repeatArr(transactions, 5));

const sorted = repeated.sort((f1, f2) => {
    if (f1.dateFor !== f2.dateFor)
        return new Date(f1.dateFor) > new Date(f2.dateFor) ? -1 : 1;

    if (f1.customer.name !== f2.customer.name)
        return f1.customer.name > f2.customer.name ? 1 : -1;

    if (f1.product.id !== f2.product.id)
        return f1.product.id > f2.product.id ? 1 : -1;

    return 0;
});
export default sorted;

export const dates = sorted
    .map((fragment) => fragment.dateFor)
    .filter((v, i, a) => a.indexOf(v) === i);
