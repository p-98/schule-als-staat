import { reassignIDs, repeatArr, IProduct } from "Utility/dataMockup";

const products: IProduct[] = [
    {
        id: "",
        name: "Burger",
        price: 15.521,
    },
    {
        id: "",
        name: "Pommes",
        price: 9.467,
    },
    {
        id: "",
        name: "Cola",
        price: 6.235,
    },
];

export default reassignIDs(repeatArr(products, 3));
