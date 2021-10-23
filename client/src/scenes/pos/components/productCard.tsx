import React from "react";
import { Typography } from "@rmwc/typography";
import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import {
    Card,
    CardContent,
    CardHeader,
    CardPrimaryAction,
} from "Components/card/card";
import { IProduct } from "Utility/types";
import { parseCurrency } from "Utility/parseCurrency";
import { HightlightStates } from "Components/highlightStates/highlightStates";

import styles from "../pos.module.css";

interface IProductCardProps {
    product: IProduct;
    quantity: number;
    setQuantity: (quantity: number) => void;
}

export const ProductCard = React.memo<IProductCardProps>(
    ({ product, quantity, setQuantity }) => {
        const handleSetQuantity = (
            e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
            newQuantity: number
        ) => {
            e.stopPropagation();
            setQuantity(newQuantity);
        };

        return (
            <Card>
                <HightlightStates selected={quantity !== 0}>
                    <CardPrimaryAction
                        onClick={(
                            e: React.MouseEvent<HTMLButtonElement, MouseEvent>
                        ) => handleSetQuantity(e, quantity + 1)}
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
                                ) =>
                                    setQuantity(
                                        parseInt(e.currentTarget.value, 10)
                                    )
                                }
                                outlined
                                onClick={(e) => e.stopPropagation()}
                                trailingIcon={{
                                    icon: "clear",
                                    onClick: (
                                        e: React.MouseEvent<
                                            HTMLButtonElement,
                                            MouseEvent
                                        >
                                    ) => handleSetQuantity(e, 0),
                                }}
                            />
                        </CardContent>
                    </CardPrimaryAction>
                </HightlightStates>
            </Card>
        );
    }
);
