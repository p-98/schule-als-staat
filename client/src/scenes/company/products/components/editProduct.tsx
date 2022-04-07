import { HTMLAttributes } from "react";
import { TextField } from "Components/material/textfield";
import { Button } from "Components/material/button";
import { IconButton } from "Components/material/icon-button";
import { CardContent, CardInner, CardHeader } from "Components/material/card";

// local
import config from "Config";
import { IProduct } from "Utility/types";

import styles from "../products.module.css";

interface IEditProductProps extends HTMLAttributes<HTMLDivElement> {
    cancel: {
        icon: string;
        onCancel: () => void;
        label: string;
    };
    confirm: {
        label: string;
        onConfirm: () => void;
        danger?: boolean;
    };
    product?: IProduct;
    title: string;
}
export const EditProduct: React.FC<IEditProductProps> = ({
    cancel,
    confirm,
    product,
    title,
    ...restProps
}) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CardInner {...restProps}>
        <CardHeader>
            <IconButton
                icon={cancel.icon}
                label={cancel.label}
                onClick={cancel.onCancel}
                className={styles["product__back-icon"]}
            />
            <span className={styles["product__header-text"]}>{title}</span>
        </CardHeader>
        <CardContent>
            <TextField label="Name" defaultValue={product?.name} />
            <TextField
                label={`Preis in ${config.currencies.virtual.short}`}
                defaultValue={product?.price}
            />
        </CardContent>
        <CardContent>
            <Button onClick={confirm.onConfirm} raised danger={confirm.danger}>
                {confirm.label}
            </Button>
        </CardContent>
    </CardInner>
);
