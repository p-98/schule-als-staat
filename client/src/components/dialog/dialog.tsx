import React from "react";
import {
    Dialog as RMWCDialog,
    DialogOnClosedEventT,
    DialogOnCloseEventT,
    DialogOnOpenedEventT,
    DialogOnOpenEventT,
} from "@rmwc/dialog";
import { PortalPropT } from "@rmwc/base";
import { MDCDialogFoundation } from "@material/dialog";

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
        handler?: () => void;
        danger?: boolean;
        disabled?: boolean;
        isDefaultAction?: boolean;
        raised?: boolean;
    };
    cancel?: {
        label: string;
        handler?: () => void;
    };
    title?: string;

    // forwarded dialog props
    open?: boolean;
    onOpen?: (e: DialogOnOpenEventT) => void;
    onClose?: (e: DialogOnCloseEventT) => void;
    onOpened?: (e: DialogOnOpenedEventT) => void;
    onClosed?: (e: DialogOnClosedEventT) => void;
    preventOutsideDismiss?: boolean;
    renderToPortal?: PortalPropT;
}
export const SimpleDialog = React.memo(
    React.forwardRef<HTMLDivElement, SimpleDialogProps>(
        ({ title, accept, cancel, children, ...restProps }, ref) => {
            const defaultProp = accept?.isDefaultAction
                ? {
                      [MDCDialogFoundation.strings
                          .BUTTON_DEFAULT_ATTRIBUTE]: true,
                  }
                : {};

            return (
                <RMWCDialog
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...restProps}
                    onClose={(e) => {
                        restProps.onClose?.(e);
                        if (e.detail.action === "accept") accept?.handler?.();
                        if (e.detail.action === "close") cancel?.handler?.();
                    }}
                    ref={ref}
                    // needed to make focus traps work correctly as disabled button is not focusable
                    key={accept?.disabled?.toString()}
                >
                    <CardInner className={styles["dialog__card-inner"]}>
                        {title && <CardHeader>{title}</CardHeader>}
                        {children}
                        {(cancel || accept) && (
                            <CardActions dialogLayout>
                                {cancel && (
                                    <CardActionButton
                                        data-mdc-dialog-action="close"
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...(accept?.disabled && defaultProp)}
                                    >
                                        {cancel.label}
                                    </CardActionButton>
                                )}
                                {accept && (
                                    <CardActionButton
                                        danger={accept.danger}
                                        disabled={accept.disabled}
                                        raised={accept.raised}
                                        // eslint-disable-next-line react/jsx-props-no-spreading
                                        {...defaultProp}
                                        data-mdc-dialog-action="accept"
                                    >
                                        {accept.label}
                                    </CardActionButton>
                                )}
                            </CardActions>
                        )}
                    </CardInner>
                </RMWCDialog>
            );
        }
    )
);
