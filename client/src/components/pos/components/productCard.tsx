import React, { type MouseEvent } from "react";
import { Typography } from "Components/material/typography";
import { TextField } from "Components/material/textfield";
import {
    Card,
    CardContent,
    CardHeader,
    CardPrimaryAction,
} from "Components/material/card";

// local
import type { ChangeEvent } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { HightlightStates } from "Components/highlightStates/highlightStates";

import styles from "../pos.module.css";

export const Card_ProductFragment = graphql(/* GraphQL */ `
    fragment Card_ProductFragment on Product {
        id
        name
        price
    }
`);

interface IProductCardProps {
    product: FragmentType<typeof Card_ProductFragment>;
    quantity: number;
    setQuantity: (value: number) => void;
}
export const ProductCard = React.memo<IProductCardProps>(
    ({ product: _product, quantity, setQuantity }) => {
        const product = useFragment(Card_ProductFragment, _product);

        const increment = () => setQuantity(quantity + 1);
        const reset = () => setQuantity(0);
        const set = (to: number) => setQuantity(to);

        return (
            <Card>
                <HightlightStates selected={quantity !== 0}>
                    <CardPrimaryAction
                        onClick={(e: MouseEvent) => {
                            e.stopPropagation();
                            increment();
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
                                id={`pos__proudct-count#${product.id}`}
                                onChange={(e: ChangeEvent) => {
                                    e.stopPropagation();
                                    const newQuantity = parseInt(
                                        e.currentTarget.value,
                                        10
                                    );
                                    if (Number.isNaN(newQuantity)) return;
                                    set(newQuantity);
                                }}
                                outlined
                                onClick={(e) => e.stopPropagation()}
                                trailingIcon={{
                                    icon: "clear",
                                    onClick: (e: MouseEvent) => {
                                        e.stopPropagation();
                                        reset();
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
