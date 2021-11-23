import type { IProduct, TFilteredCart } from "Utility/types";

export const useFilteredCart = (
    products: IProduct[],
    cart: Record<string, number>
): TFilteredCart =>
    products.reduce<TFilteredCart>((mergedProducts, product) => {
        const quantity = cart[product.id] as number;

        if (quantity > 0) mergedProducts.push({ ...product, quantity });

        return mergedProducts;
    }, []);
