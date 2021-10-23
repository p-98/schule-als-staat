import React, { useRef, useState } from "react";
import cn from "classnames";
import { SimpleDataTable } from "@rmwc/data-table";
import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// data-table imports
import "@material/data-table/dist/mdc.data-table.css";
import "@rmwc/data-table/data-table.css";
// import "@rmwc/icon/icon.css";

// local
import type { IProduct } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { SimpleDialog } from "Components/dialog/dialog";
import { CardContent } from "Components/card/card";
import config from "Config";
import {
    activatedClassName,
    nonInteractiveClassName,
} from "Components/highlightStates/highlightStates";

import styles from "../pos.module.css";

const useMergedProducts = (
    products: IProduct[],
    cart: Record<string, number>
) =>
    products.reduce<(IProduct & { quantity: number })[]>(
        (mergedProducts, product) => {
            const quantity = cart[product.id] as number;

            if (quantity > 0) mergedProducts.push({ ...product, quantity });

            return mergedProducts;
        },
        []
    );

// enum Columns {
//     Product,
//     Quantity,
//     Price,
// }

interface ICartProps {
    open: boolean;
    cart: Record<string, number>;
    products: IProduct[];
    onCancel: () => void;
    onToCheckout: (discount: number) => void;
}
export const Cart = React.memo<ICartProps>(
    ({ open, cart, products: productsProp, onCancel, onToCheckout }) => {
        const [discount, setDiscount] = useState<"" | number>("");
        const discountRef = useRef<HTMLInputElement>(null);
        const dialogRef = useRef<HTMLDivElement>(null);

        const products = useMergedProducts(productsProp, cart);

        const total = products.reduce(
            (_total, product) => _total + product.price,
            0
        );

        let rowIndex = -1;
        return (
            <SimpleDialog
                open={open}
                ref={dialogRef}
                title="Warenkorb"
                accept={{
                    label: "Zur Kasse",
                    handler: () => onToCheckout(discount === "" ? 0 : discount),
                    disabled: products.length === 0,
                    isDefaultAction: true,
                }}
                cancel={{ label: "Zurück", handler: onCancel }}
            >
                <CardContent className={styles["pos__data-table-card-content"]}>
                    <SimpleDataTable
                        headers={[["Produkt", "Menge", "Preis"]]}
                        data={[
                            ...products.map(({ name, quantity, price }) => [
                                name,
                                quantity,
                                parseCurrency(quantity * price),
                            ]),
                            ["Gesamt", "", parseCurrency(total)],
                        ]}
                        getCellProps={(cell, index, isHead) => {
                            if (index === 0 && !isHead) rowIndex += 1;

                            const totalRow =
                                rowIndex === products.length && !isHead;

                            return {
                                isNumeric: index && !isHead,
                                className: cn(
                                    totalRow &&
                                        cn(
                                            activatedClassName,
                                            nonInteractiveClassName
                                        )
                                ),
                                ...(totalRow && {
                                    style: { fontWeight: "500" },
                                }),
                            };
                        }}
                    />
                </CardContent>
                <CardContent>
                    <TextField
                        type="number"
                        label={`Vergünstigung (in ${config.currencies.virtual.short})`}
                        value={discount}
                        id="discount"
                        onChange={(e) =>
                            setDiscount(parseInt(e.currentTarget.value, 10))
                        }
                        ref={discountRef}
                    />
                </CardContent>
            </SimpleDialog>
        );
    }
);
