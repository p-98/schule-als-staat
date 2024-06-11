import { constant } from "lodash/fp";
import React, {
    forwardRef,
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import {
    Dialog as RMWCDialog,
    DialogContent as RMWCDialogContent,
    DialogContentProps as RMWCDialogContentProps,
    DialogOnClosedEventT,
    DialogOnCloseEventT,
    DialogOnOpenedEventT,
    DialogOnOpenEventT,
    DialogProps,
} from "@rmwc/dialog";
import { PortalPropT } from "@rmwc/base";
import RMWC from "@rmwc/types";
import { Typography } from "@rmwc/typography";
import { MDCDialogFoundation } from "@material/dialog";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "@rmwc/icon/icon.css";
import "@rmwc/ripple/ripple.css";
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

/** Hook to control dialog imperatively.
 *
 * Dialog is open by default, and can be closed only once. Needs remount to be reused.
 *
 * Useful e.g. to close after data load and call event handler afterwards.
 * @example <caption>Full usage pattern:</caption>
 *  const [impProps, close] = useImperativeDialog()
 *
 *  const handleClick = () => useCallback(() => {
 *      // perform mutation and show error states if required.
 *      await close()
 *      onSuccess()
 *  }, [close, onSuccess])
 *
 *  return (
 *      <Dialog {impProps}>
 *          <Button onClick={syncifyF(handleClick)} />
 *      </Dialog>
 *  )
 * */
export const useImperativeDialog = (): [
    Partial<DialogProps>,
    () => Promise<void>
] => {
    const foundationRef = useRef<MDCDialogFoundation>(null);
    const [open, setOpen] = useState(true);
    const [onClosed, setOnClosed] = useState<() => void>();

    useEffect(() => {
        const foundation = foundationRef.current;
        if (!foundation) throw Error("imperative dialog: no foundation");

        const closeMDC = foundation.close.bind(foundation);
        foundation.close = function close(action?: string | undefined): void {
            if (action) return;
            closeMDC(action);
        };
    }, []);

    const close = useCallback(
        (): Promise<void> =>
            new Promise((resolve) => {
                if (!open) throw new Error("imperative dialog: already closed");
                setOnClosed(constant(resolve));
                setOpen(false);
            }),
        [open, setOnClosed, setOpen]
    );

    return [
        {
            foundationRef,
            open,
            onClosed: () => {
                if (!onClosed)
                    throw new Error("imperative dialog: onClosed undefined");
                onClosed();
            },
        },
        close,
    ];
};

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

// ignore type naming convention to imitate RMWC
export type DialogContentProps = RMWC.ComponentProps<
    RMWCDialogContentProps,
    React.HTMLProps<HTMLElement>,
    "div"
> & {
    layout?: "dialog" | "card";
};
export const DialogContent = forwardRef<HTMLDivElement, DialogContentProps>(
    ({ layout = "dialog", ...restProps }, ref) => {
        const Tag = layout === "card" ? CardContent : RMWCDialogContent;
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <Tag {...restProps} ref={ref} />;
    }
);
