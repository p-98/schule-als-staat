import React from "react";
// local
import type { IProduct } from "Utility/types";
import { SimpleDialog } from "Components/dialog/dialog";
import { CartTable } from "./cartTable";
import { TCart } from "../util/useCart";

interface ICartProps {
    open: boolean;
    cart: TCart;
    products: IProduct[];
    onCancelled: () => void;
    proceed: {
        label: string;
        handler: () => void;
        raised?: boolean;
        danger?: boolean;
    };
    additionalContent?: React.ReactNode;
}
export const Cart = React.memo<ICartProps>(
    ({ open, cart, products, onCancelled, proceed }) => (
        <SimpleDialog
            open={open}
            title="Warenkorb"
            accept={{
                label: proceed.label,
                onAccept: proceed.handler,
                disabled: Object.values(cart).length === 0,
                isDefaultAction: true,
                raised: proceed.raised,
                danger: proceed.danger,
            }}
            cancel={{ label: "Zurück", onCancelled }}
        >
            <CartTable cart={cart} products={products} />
        </SimpleDialog>
    )
);
