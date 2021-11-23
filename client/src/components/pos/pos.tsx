import React, { useState } from "react";
import { GridCell } from "@rmwc/grid";
import { Fab } from "@rmwc/fab";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// fab imports
import "@material/fab/dist/mdc.fab.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { IProduct } from "Utility/types";
import { ProductCard } from "./components/productCard";
import { Cart } from "./components/cart";
import { TWithCartProps } from "./util/types";

import styles from "./pos.module.css";

export { CartTable } from "./components/cartTable";

interface IPOSProps {
    proceed: { label: string; handler?: () => void };
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
            <PageGrid>
                {products.map((product) => (
                    <GridCell desktop={3} tablet={2} phone={2} key={product.id}>
                        <ProductCard
                            product={product}
                            cart={cart}
                            cartActions={cartActions}
                        />
                    </GridCell>
                ))}
            </PageGrid>
            <Fab
                icon="shopping_cart"
                className={styles["pos__fab"]}
                onClick={() => setCartOpen(true)}
            />
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
                }}
                products={products}
                cart={cart}
                additionalContent={additionalCartContent}
            />
        </>
    );
};
