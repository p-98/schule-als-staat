import cn from "classnames";
import { SimpleDataTable } from "@rmwc/data-table";

// data-table imports
import "@material/data-table/dist/mdc.data-table.css";
import "@rmwc/data-table/data-table.css";
import "@rmwc/icon/icon.css";

// local
import type { TFilteredCart } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { CardContent } from "Components/card/card";
import {
    activatedClassName,
    nonInteractiveClassName,
} from "Components/highlightStates/highlightStates";

import styles from "../pos.module.css";

interface ICartTableProps {
    filteredCart: TFilteredCart;
    discount?: number;
}
export const CartTable: React.FC<ICartTableProps> = ({
    filteredCart,
    discount: discountProp,
}) => {
    const discount: number = discountProp || 0;

    // calculate total
    let total = filteredCart.reduce(
        (_total, product) => _total + product.price,
        0
    );
    total -= discount;

    // generate data prop
    const data = filteredCart.map(({ name, quantity, price }) => [
        name,
        quantity,
        parseCurrency(quantity * price),
    ]);
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
                        rowIndex === filteredCart.length && !isHead;

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
