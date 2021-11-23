import { TCart, TCartActions } from "./useCart";

export type TWithCartProps<T = unknown> = T & {
    cart: TCart;
    cartActions: TCartActions;
};
