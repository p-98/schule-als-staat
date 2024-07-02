import { assign, identity, startsWith } from "lodash/fp";
import { TypedEventTarget } from "typescript-event-target";
import { type FC, useState, useMemo, useEffect } from "react";
import { Fab } from "Components/material/fab/fab";
import {
    Dialog,
    type DialogOnClosedEventT,
    type DialogOnCloseEventT,
    type DialogOnOpenedEventT,
    type DialogOnOpenEventT,
    type DialogProps,
} from "Components/material/dialog";

import { ActionCard, TAction } from "Components/actionCard/actionCard";
import { currency, parseCurrency } from "Utility/data";
import { graphql } from "Utility/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { event } from "Utility/misc";

export type DialogEventTarget = TypedEventTarget<{
    close: DialogOnCloseEventT;
    closed: DialogOnClosedEventT;
    open: DialogOnOpenEventT;
    opened: DialogOnOpenedEventT;
}>;
export type DialogEventProps = Pick<
    DialogProps,
    "onClose" | "onClosed" | "onOpen" | "onOpened"
>;
export const useDialogEvents = (): [DialogEventTarget, DialogEventProps] =>
    useMemo(() => {
        const dialog: DialogEventTarget = new TypedEventTarget();
        const props: DialogEventProps = {
            onClose: (e) => dialog.dispatchTypedEvent("close", e),
            onClosed: (e) => dialog.dispatchTypedEvent("closed", e),
            onOpen: (e) => dialog.dispatchTypedEvent("open", e),
            onOpened: (e) => dialog.dispatchTypedEvent("opened", e),
        };
        return [dialog, props];
    }, []);

export type DialogActions = {
    close: () => void;
    open: () => void;
};
export type DialogActionsProps = Pick<DialogProps, "open">;
export const useDialogActions = (
    open: boolean
): [DialogActions, DialogActionsProps] => {
    const [_open, _setOpen] = useState(open);
    useEffect(() => _setOpen(open), [open]);
    const actions: DialogActions = useMemo(
        () => ({
            close: () => _setOpen(false),
            open: () => _setOpen(true),
        }),
        []
    );
    const props: DialogActionsProps = useMemo(() => ({ open: _open }), [_open]);
    return [actions, props];
};

export type AsyncDialog = DialogEventTarget & {
    close: () => Promise<void>;
    open: () => Promise<void>;
};
export type AsyncDialogProps = Pick<
    DialogProps,
    "onClose" | "onClosed" | "onOpen" | "onOpened" | "open"
>;
export const useAsyncDialog = (
    open: boolean
): [AsyncDialog, AsyncDialogProps] => {
    const [dialog, eventProps] = useDialogEvents();
    const [actions, actionProps] = useDialogActions(open);
    const _dialog: AsyncDialog = useMemo(
        () =>
            assign(dialog, {
                close: async () => {
                    actions.close();
                    await event("closed", dialog);
                },
                open: async () => {
                    actions.open();
                    await event("opened", dialog);
                },
            }),
        [dialog, actions]
    );
    const props: AsyncDialogProps = useMemo(
        () => ({ ...eventProps, ...actionProps }),
        [eventProps, actionProps]
    );
    return [_dialog, props];
};

type Inputs = [string, number];

const mutation = graphql(/* GraphQL */ `
    mutation AddProductMutation($name: String!, $price: Float!) {
        addProduct(product: { name: $name, price: $price }) {
            id
        }
    }
`);
const action: TAction<[], Inputs> = async ([name, price]) => {
    const result = await client.mutation(mutation, { name, price });
    const { data, error } = safeData(result);
    const [nameError, priceError] = categorizeError(error, [
        byCode(startsWith("NAME")),
        byCode(startsWith("PRICE")),
    ]);
    return {
        data: data ? [] : undefined,
        inputErrors: [nameError, priceError],
    };
};

export const AddProduct: FC = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            <Fab icon="add" onClick={() => setOpen(true)} />
            <Dialog open={open} onClose={() => setOpen(false)} renderToPortal>
                <ActionCard<[], Inputs>
                    action={action}
                    inputs={[
                        {
                            label: "Name",
                            type: "text",
                            fromInput: identity,
                            toInput: identity,
                            init: "",
                        },
                        {
                            label: "Preis",
                            type: "text",
                            fromInput: parseCurrency,
                            toInput: (_) => currency(_, { unit: "none" }),
                            init: 0,
                        },
                    ]}
                    title="Product erstellen"
                    confirmButton={{ label: "Erstellen", raised: true }}
                    onSuccess={() => setOpen(false)}
                    cancelButton={{ label: "Abbrechen" }}
                    onCancel={() => setOpen(false)}
                    inner
                />
            </Dialog>
        </>
    );
};
