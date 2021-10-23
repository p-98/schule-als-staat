import React, { useState, useMemo } from "react";
import { GridCell } from "@rmwc/grid";
import { Fab } from "@rmwc/fab";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// fab imports
import "@material/fab/dist/mdc.fab.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { id } from "Utility/objectId";
import { ProductCard } from "./components/productCard";
import products from "./pos.data";
import { Cart } from "./components/cart";

import styles from "./pos.module.css";
import { Checkout } from "./components/checkout";

type TStages = "shop" | "cart" | "checkout";

export const POS: React.FC = () => {
    const emptyCart = useMemo(
        () =>
            products.reduce<Record<string, number>>(
                (cartObj, product) => ({ ...cartObj, [product.id]: 0 }),
                {}
            ),
        []
    );

    const [cart, setCart] = useState(emptyCart);
    const [stage, setStage] = useState<TStages>("shop");

    return (
        <>
            <PageGrid>
                {products.map((product) => (
                    <GridCell desktop={3} tablet={2} phone={2} key={product.id}>
                        <ProductCard
                            product={product}
                            quantity={cart[product.id] as number}
                            setQuantity={(quantity) =>
                                setCart({
                                    ...cart,
                                    [product.id]: quantity,
                                })
                            }
                        />
                    </GridCell>
                ))}
            </PageGrid>
            <Fab
                icon="shopping_cart"
                className={styles["pos__fab"]}
                onClick={() => setStage("cart")}
            />
            <Cart
                open={stage === "cart"}
                onCancel={() => setStage("shop")}
                onToCheckout={() => setStage("checkout")}
                products={products}
                cart={cart}
                key={`cart${id(cart)}`}
            />
            <Checkout
                onCheckout={() => {
                    setStage("shop");
                    setCart(emptyCart);
                }}
                open={stage === "checkout"}
                onGoBack={() => setStage("cart")}
                key={`checkout${id(cart)}`}
            />
        </>
    );
};
