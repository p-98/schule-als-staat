import { useMemo, useReducer } from "react";

export type TCart = Record<string, number>;

type TCartAction =
    | { type: "incement"; id: string }
    | { type: "set"; id: string; quantity: number }
    | { type: "clear"; id: string }
    | { type: "clearAll" };

const cartReducer = (cart: TCart, action: TCartAction): TCart => {
    if (action.type === "clearAll") return {};

    const oldAmount = cart[action.id] || 0;

    // eslint-disable-next-line default-case
    switch (action.type) {
        case "incement":
            return { ...cart, [action.id]: oldAmount + 1 };
        case "set": {
            const newCart = { ...cart, [action.id]: action.quantity };

            if (action.quantity === 0) delete newCart[action.id];

            return newCart;
        }
        case "clear": {
            const newCart = { ...cart };
            delete newCart[action.id];

            return newCart;
        }
    }
};

export type TCartActions = {
    increment: (id: string) => void;
    set: (id: string, quantity: number) => void;
    clear: (id?: string) => void;
};

export const useCart = (): [TCart, TCartActions] => {
    const [cart, dispatch] = useReducer(cartReducer, {});

    const cartActions = useMemo(
        () => ({
            increment: (id: string) => dispatch({ type: "incement", id }),
            set: (id: string, quantity: number) =>
                dispatch({ type: "set", id, quantity }),
            clear: (id?: string) =>
                id
                    ? dispatch({ type: "clear", id })
                    : dispatch({ type: "clearAll" }),
        }),
        [dispatch]
    );

    return useMemo(() => [cart, cartActions], [cart, cartActions]);
};
