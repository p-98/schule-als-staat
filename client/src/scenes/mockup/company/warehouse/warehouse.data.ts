import { reassignIDs, repeatArr, IProduct } from "Utility/dataMockup";

const products: IProduct[] = [
    {
        id: "",
        name: "Ketchup",
        price: 15.521,
    },
    {
        id: "",
        name: "Getränk",
        price: 9.467,
    },
    {
        id: "",
        name: "Servietten",
        price: 6.235,
    },
    {
        id: "",
        name: "Milch",
        price: 7.394,
    },
];

export default reassignIDs(repeatArr(products, 3));
