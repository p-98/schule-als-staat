import React from "react";
import {
    Dialog as RMWCDialog,
    DialogOnClosedEventT,
    DialogOnCloseEventT,
    DialogOnOpenedEventT,
    DialogOnOpenEventT,
} from "@rmwc/dialog";
import { PortalPropT } from "@rmwc/base";
import { Typography } from "@rmwc/typography";
import { MDCDialogFoundation } from "@material/dialog";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "@material/ripple/dist/mdc.ripple.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import {
    CardInner,
    CardHeader,
    CardContent,
    CardActions,
    CardActionButton,
} from "Components/material/card/";

import styles from "./dialog.module.css";

export * from "@rmwc/dialog";

// ignore type naming convention to imitate RMWC
/* eslint-disable react/no-unused-prop-types */
export interface SimpleDialogProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
    accept?: {
        label: string;
        onAccept?: () => void;
        onAccepted?: () => void;
        danger?: boolean;
        disabled?: boolean;
        isDefaultAction?: boolean;
        raised?: boolean;
    };
    cancel?: {
        label: string;
        onCancel?: () => void;
        onCancelled?: () => void;
    };
    title?: string;
    /** a simple content text */
    content?: React.ReactNode;

    // forwarded dialog props
    open?: boolean;
    onOpen?: (e: DialogOnOpenEventT) => void;
    onClose?: (e: DialogOnCloseEventT) => void;
    onOpened?: (e: DialogOnOpenedEventT) => void;
    onClosed?: (e: DialogOnClosedEventT) => void;
    preventOutsideDismiss?: boolean;
    renderToPortal?: PortalPropT;
}
/* eslint-enable react/no-unused-prop-types */
export const SimpleDialog = React.memo(
    React.forwardRef<HTMLDivElement, SimpleDialogProps>(
        ({ title, content, accept, cancel, children, ...restProps }, ref) => {
            const defaultProp = accept?.isDefaultAction
                ? {
                      [MDCDialogFoundation.strings.BUTTON_DEFAULT_ATTRIBUTE]:
                          true,
                  }
                : {};

            return (
                <RMWCDialog
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...restProps}
                    onClose={(e) => {
                        restProps.onClose?.(e);
                        if (e.detail.action === "accept") accept?.onAccept?.();
                        if (e.detail.action === "close") cancel?.onCancel?.();
                    }}
                    onClosed={(e) => {
                        restProps.onClosed?.(e);
                        if (e.detail.action === "accept")
                            accept?.onAccepted?.();
                        if (e.detail.action === "close")
                            cancel?.onCancelled?.();
                    }}
                    ref={ref}
                    // needed to make focus traps work correctly as disabled button is not focusable
                    key={accept?.disabled?.toString()}
                >
                    <CardInner className={styles["dialog__card-inner"]}>
                        {title && <CardHeader>{title}</CardHeader>}
                        {content && (
                            <CardContent>
                                <Typography
                                    use="body1"
                                    theme="textSecondaryOnBackground"
                                >
                                    {content}
                                </Typography>
                            </CardContent>
                        )}
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
