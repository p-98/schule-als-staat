import { HTMLAttributes } from "react";
import { TextField } from "@rmwc/textfield";
import { Button } from "@rmwc/button";
import { IconButton } from "@rmwc/icon-button";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// button imports
import "@material/button/dist/mdc.button.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import { CardContent, CardInner, CardHeader } from "Components/card/card";
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
