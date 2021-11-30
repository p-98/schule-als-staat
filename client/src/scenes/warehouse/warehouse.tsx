import { useState } from "react";

// local
import { useCart } from "Components/pos/util/useCart";
import { POS } from "Components/pos/pos";
import products from "./warehouse.data";
import { Checkout } from "./components/checkout";

export const Warehouse: React.FC = () => {
    const [cart, cartActions] = useCart();
    const [checkoutOpen, setCheckoutOpen] = useState(false);

    return (
        <>
            <POS
                cart={cart}
                cartActions={cartActions}
                products={products}
                proceed={{
                    label: "Zur Kasse",
                    handler: () => setCheckoutOpen(true),
                }}
            />
            <Checkout
                onCheckout={() => {
                    setCheckoutOpen(false);
                    cartActions.clear();
                }}
                cart={cart}
                products={products}
                open={checkoutOpen}
                onGoBack={() => setCheckoutOpen(false)}
            />
        </>
    );
};
