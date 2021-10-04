import React from "react";
import { Dialog as RMWCDialog } from "@rmwc/dialog";
import { PortalPropT } from "@rmwc/base";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "@material/ripple/dist/mdc.ripple.css";

// local
import {
    CardInner,
    CardHeader,
    CardActions,
    CardActionButton,
} from "Components/card/card";

import styles from "./dialog.module.css";

export * from "@rmwc/dialog";

// ignore type naming convention to imitate RMWC
export interface SimpleDialogProps
    extends React.HTMLAttributes<HTMLDivElement> {
    accept?: {
        label: string;
        handler: () => void;
        danger?: boolean;
    };
    cancel?: {
        label: string;
        handler: () => void;
    };
    title?: string;

    // forwarded dialog props
    open?: boolean;
    preventOutsideDismiss?: boolean;
    renderToPortal?: PortalPropT;
}
export const SimpleDialog = React.memo<SimpleDialogProps>(
    ({ title, accept, cancel, children, ...restProps }) => (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <RMWCDialog {...restProps} onClose={cancel?.handler}>
            <CardInner>
                {title && <CardHeader>{title}</CardHeader>}
                {children}
                {(cancel || accept) && (
                    <CardActions className={styles["dialog__actions"]}>
                        {cancel && (
                            <CardActionButton onClick={cancel.handler}>
                                {cancel.label}
                            </CardActionButton>
                        )}
                        {accept && (
                            <CardActionButton
                                danger={accept.danger}
                                onClick={accept.handler}
                            >
                                {accept.label}
                            </CardActionButton>
                        )}
                    </CardActions>
                )}
            </CardInner>
        </RMWCDialog>
    )
);
