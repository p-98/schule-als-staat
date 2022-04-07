import React from "react";
import { Typography } from "Components/material/typography";
import { TextField } from "Components/material/textfield";
import {
    Card,
    CardContent,
    CardHeader,
    CardPrimaryAction,
} from "Components/material/card";

// local
import { IProduct } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { HightlightStates } from "Components/highlightStates/highlightStates";
import { TWithCartProps } from "../util/types";

import styles from "../pos.module.css";

type TTypedMouseEvent = React.MouseEvent<HTMLButtonElement, MouseEvent>;

interface IProductCardProps {
    product: IProduct;
}
export const ProductCard = React.memo<TWithCartProps<IProductCardProps>>(
    ({ product, cart, cartActions }) => {
        const quantity = cart[product.id] || 0;

        return (
            <Card>
                <HightlightStates selected={quantity !== 0}>
                    <CardPrimaryAction
                        onClick={(e: TTypedMouseEvent) => {
                            e.stopPropagation();
                            cartActions.increment(product.id);
                        }}
                    >
                        <CardHeader
                            theme={quantity !== 0 ? "primary" : undefined}
                        >
                            {product.name}
                        </CardHeader>
                        <Typography
                            use="subtitle1"
                            theme="textSecondaryOnBackground"
                            className={styles["pos__card-subtitle"]}
                        >
                            {parseCurrency(product.price)}
                        </Typography>
                        <CardContent>
                            <TextField
                                value={quantity}
                                type="number"
                                label="Menge"
                                id={`count-product#${product.id}`}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => {
                                    e.stopPropagation();
                                    cartActions.set(
                                        product.id,
                                        parseInt(e.currentTarget.value, 10)
                                    );
                                }}
                                outlined
                                onClick={(e) => e.stopPropagation()}
                                trailingIcon={{
                                    icon: "clear",
                                    onClick: (e: TTypedMouseEvent) => {
                                        e.stopPropagation();
                                        cartActions.clear(product.id);
                                    },
                                }}
                            />
                        </CardContent>
                    </CardPrimaryAction>
                </HightlightStates>
            </Card>
        );
    }
);
