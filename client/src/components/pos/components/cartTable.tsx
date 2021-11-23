import cn from "classnames";
import { SimpleDataTable } from "@rmwc/data-table";

// data-table imports
import "@material/data-table/dist/mdc.data-table.css";
import "@rmwc/data-table/data-table.css";
import "@rmwc/icon/icon.css";

// local
import type { IProduct } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { CardContent } from "Components/card/card";
import {
    activatedClassName,
    nonInteractiveClassName,
} from "Components/highlightStates/highlightStates";
import { TCart } from "../util/useCart";

import styles from "../pos.module.css";

interface ICartTableProps {
    products: IProduct[];
    cart: TCart;
    discount?: number;
}
export const CartTable: React.FC<ICartTableProps> = ({
    products,
    cart,
    discount: discountProp,
}) => {
    const discount: number = discountProp || 0;

    let total = 0;
    const data: [string, string, string][] = [];

    // calc total and generate data prop
    Object.entries(cart).forEach(([id, quantity]) => {
        const product = products.find(
            (_product) => _product.id === id
        ) as IProduct;

        total += quantity * product.price;

        data.push([
            product.name,
            quantity.toString(),
            parseCurrency(quantity * product.price),
        ]);
    });

    if (discount) data.push(["Vergünstigung", "", parseCurrency(-discount)]);
    data.push(["Gesamt", "", parseCurrency(total)]);

    let rowIndex = discount ? -2 : -1;
    return (
        <CardContent className={styles["pos__data-table-card-content"]}>
            <SimpleDataTable
                headers={[["Produkt", "Menge", "Preis"]]}
                data={data}
                getCellProps={(cell, index, isHead) => {
                    if (index === 0 && !isHead) rowIndex += 1;

                    const totalRow =
                        rowIndex === Object.values(cart).length && !isHead;

                    return {
                        isNumeric: index && !isHead,
                        className: cn(
                            totalRow &&
                                cn(activatedClassName, nonInteractiveClassName)
                        ),
                        ...(totalRow && {
                            style: { fontWeight: "500" },
                        }),
                    };
                }}
            />
        </CardContent>
    );
};
