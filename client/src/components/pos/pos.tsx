import React, { useState } from "react";
import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { GridPage } from "Components/page/page";
import { Fab } from "Components/fab/fab";
import { IProduct } from "Utility/types";
import { ProductCard } from "./components/productCard";
import { Cart } from "./components/cart";
import { TWithCartProps } from "./util/types";

export { CartTable } from "./components/cartTable";

interface IPOSProps {
    proceed: {
        label: string;
        handler?: () => void;
        raised?: boolean;
        danger?: boolean;
    };
    additionalCartContent?: React.ReactNode;
    products: IProduct[];
    onClosedCart?: () => void;
}
export const POS: React.FC<TWithCartProps<IPOSProps>> = ({
    cart,
    cartActions,
    products,
    proceed,
    additionalCartContent,
    onClosedCart,
}) => {
    const [cartOpen, setCartOpen] = useState(false);

    return (
        <>
            <GridPage>
                {products.map((product) => (
                    <GridCell desktop={3} tablet={2} phone={2} key={product.id}>
                        <ProductCard
                            product={product}
                            cart={cart}
                            cartActions={cartActions}
                        />
                    </GridCell>
                ))}
            </GridPage>
            <Fab icon="shopping_cart" onClick={() => setCartOpen(true)} />
            <Cart
                open={cartOpen}
                onCancelled={() => {
                    setCartOpen(false);
                    onClosedCart?.();
                }}
                proceed={{
                    label: proceed.label,
                    handler: () => {
                        setCartOpen(false);
                        proceed.handler?.();
                    },
                    raised: proceed.raised,
                    danger: proceed.danger,
                }}
                products={products}
                cart={cart}
                additionalContent={additionalCartContent}
            />
        </>
    );
};
