import React, { useState } from "react";
import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { POS as POSComponent } from "Components/pos/pos";
import { useCart } from "Components/pos/util/useCart";
import { CardContent } from "Components/card/card";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import config from "Config";
import { Checkout } from "./components/checkout";
import products from "./pos.data";

interface IDiscountInputProps {
    value: number;
    onChange: (value: number) => void;
}
const DiscountInput: React.FC<IDiscountInputProps> = ({ value, onChange }) => (
    <CardContent>
        <TextField
            type="number"
            label={`Vergünstigung (in ${config.currencies.virtual.short})`}
            value={value || ""}
            id="discount"
            onChange={(e) => onChange(parseInt(e.currentTarget.value, 10))}
        />
    </CardContent>
);

export const POS: React.FC = () => {
    const [cart, cartActions] = useCart();
    const [checkoutOpen, setCheckoutOpen] = useState(false);
    const [discount, setDiscount] = useState(0);

    return (
        <>
            <DrawerAppBarHandle title="Kasse" />
            <POSComponent
                cart={cart}
                cartActions={cartActions}
                products={products}
                proceed={{
                    label: "Zur Kasse",
                    handler: () => setCheckoutOpen(true),
                }}
                onClosedCart={() => setDiscount(0)}
                additionalCartContent={
                    <DiscountInput
                        value={discount}
                        onChange={(newDiscount) => setDiscount(newDiscount)}
                    />
                }
            />
            <Checkout
                onCheckout={() => {
                    setCheckoutOpen(false);
                    cartActions.clear();
                    setDiscount(0);
                }}
                cart={cart}
                products={products}
                discount={discount || undefined}
                open={checkoutOpen}
                onGoBack={() => setCheckoutOpen(false)}
            />
        </>
    );
};
