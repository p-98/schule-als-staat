import { reduce } from "lodash/fp";
import { ResultOf } from "@graphql-typed-document-node/core";
import React, {
    ReactElement,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { GridCell } from "Components/material/grid";
import { Fab } from "Components/material/fab";
import { GridPage } from "Components/page/page";

// local
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { ProductCard } from "./components/productCard";
import { Cart, TAction } from "./components/cart";

/** Execute effect except on first render */
const useRerenderEffect: typeof useEffect = (effect, deps) => {
    const isFirst = useRef(true);
    useEffect(() => {
        if (isFirst.current) {
            isFirst.current = false;
            return;
        }
        return effect();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
};

export { type TAction };

const Pos_ProductFragment = graphql(/* GraphQL */ `
    fragment Pos_ProductFragment on Product {
        id
        ...Card_ProductFragment
        ...Cart_ProductFragment
    }
`);

export type TCart<TProduct> = [TProduct, number][];
const emptyCart = <P,>(products: P[]): TCart<P> => products.map((p) => [p, 0]);

interface IPosProps<TData> {
    action: TAction<TData>;
    products: FragmentType<typeof Pos_ProductFragment>[];
    onProceeded: (data: TData) => void;
}
/** Point of sales
 *
 * Needs to be remounted to reset cart quantities.
 */
export const Pos = <TData,>({
    action,
    products: _products,
    onProceeded,
}: IPosProps<TData>): ReactElement => {
    type TProduct = ResultOf<typeof Pos_ProductFragment>;
    const products = useMemo(
        () => _products.map((_) => getFragment(Pos_ProductFragment, _)),
        [_products]
    );
    const [cart, setCart] = useState(() => emptyCart(products));
    const setQuantity =
        (product: TProduct, quantity: number) =>
        (prevCart: TCart<TProduct>): TCart<TProduct> =>
            prevCart.map(([p, q]) => [p, p.id === product.id ? quantity : q]);
    // update cart when products change
    useRerenderEffect(() => {
        setCart(
            reduce(
                (prev, [p, q]) => setQuantity(p, q)(prev),
                emptyCart(products)
            )
        );
    }, [products]);

    const [cartOpen, setCartOpen] = useState(false);
    return (
        <>
            <GridPage>
                {cart.map(([product, quantity]) => (
                    <GridCell desktop={3} tablet={2} phone={2} key={product.id}>
                        <ProductCard
                            product={product}
                            quantity={quantity}
                            setQuantity={(_) =>
                                setCart(setQuantity(product, _))
                            }
                        />
                    </GridCell>
                ))}
            </GridPage>
            <Fab icon="shopping_cart" onClick={() => setCartOpen(true)} />
            {cartOpen && (
                <Cart<TData>
                    action={action}
                    cart={cart}
                    open={cartOpen}
                    onCancelled={() => setCartOpen(false)}
                    onProceeded={(data) => {
                        setCartOpen(false);
                        onProceeded(data);
                    }}
                />
            )}
        </>
    );
};
