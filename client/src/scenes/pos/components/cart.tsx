import React, { useRef, useState } from "react";
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

// local
import type { IProduct } from "Utility/types";
import { SimpleDialog } from "Components/dialog/dialog";
import { CardContent } from "Components/card/card";
import config from "Config";
import { useFilteredCart } from "../util/filteredCart";
import { CartTable } from "./cartTable";

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
        const [discount, setDiscount] = useState<number>(0);
        const discountRef = useRef<HTMLInputElement>(null);
        const dialogRef = useRef<HTMLDivElement>(null);

        const filteredCart = useFilteredCart(productsProp, cart);

        return (
            <SimpleDialog
                open={open}
                ref={dialogRef}
                title="Warenkorb"
                accept={{
                    label: "Zur Kasse",
                    handler: () => onToCheckout(discount),
                    disabled: filteredCart.length === 0,
                    isDefaultAction: true,
                }}
                cancel={{ label: "Zurück", handler: onCancel }}
            >
                <CartTable filteredCart={filteredCart} />
                <CardContent>
                    <TextField
                        type="number"
                        label={`Vergünstigung (in ${config.currencies.virtual.short})`}
                        value={discount || ""}
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
