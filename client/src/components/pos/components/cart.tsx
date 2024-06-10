import { pick, pipe } from "lodash/fp";
import React, { ReactElement, useCallback, useMemo, useState } from "react";
import {
    Dialog,
    DialogActions,
    DialogButton,
    DialogContent,
    DialogTitle,
    useImperativeDialog,
} from "Components/material/dialog";
import { SimpleDataTable } from "Components/material/data-table/data-table";
import { Typography } from "Components/material/typography";

// local
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { currency } from "Utility/data";
import { dispatch, mapFst } from "Utility/misc";
import { useStable } from "Utility/urql";
import type { TCart } from "../pos";

/* CartTable component
 */

export const Cart_ProductFragment = graphql(/* GraphQL */ `
    fragment Cart_ProductFragment on Product {
        id
        revision
        name
        price
    }
`);
/** Abbreviation to get Cart_ProductFragment */
const gF = (fragment: FragmentType<typeof Cart_ProductFragment>) =>
    getFragment(Cart_ProductFragment, fragment);

interface ICartTableProps {
    cart: TCart<FragmentType<typeof Cart_ProductFragment>>;
    // discount: { value: number | string; onChange: (_: ChangeEvent) => void };
}
export const CartTable: React.FC<ICartTableProps> = ({
    cart /* discount, */,
}) => {
    /** Type of table data (name, quantity, price) */
    type TTableData = [string, string, string][];

    const cartData: TTableData = useMemo(
        () =>
            cart.map(([_product, quantity]) => {
                const product = getFragment(Cart_ProductFragment, _product);
                return [
                    product.name,
                    quantity.toString(),
                    currency(quantity * product.price),
                ];
            }),
        [cart]
    );
    // const discountData: [string, string, string][] = isUndefined(discount)
    //     ? []
    //     : ["Vergünstigung", "", currency(-discount)];
    const total = cart.reduce((cum, [_p, q]) => cum + gF(_p).price * q, 0);
    const totalData: TTableData = [["Gesamt", "", currency(total)]];

    return (
        // <CardContent className={styles["pos__data-table-card-content"]}>
        <SimpleDataTable
            headers={[["Produkt", "Menge", "Preis"]]}
            data={[...cartData, ...totalData]}
            getRowProps={(row) => {
                const isTotalRow = row === totalData[0];
                return {
                    ...(isTotalRow && {
                        style: { fontWeight: "500" },
                        activated: true,
                    }),
                };
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            getCellProps={(cell: any[], index: number, isHead: boolean) => ({
                isNumeric: index !== 0 && !isHead,
            })}
        />
        // </CardContent>
    );
};

/* Cart component
 */

export type TAction<TData> = (
    cart: TCart<{ id: string; revision: string }>
) => Promise<{ data?: TData; unspecificError?: Error }>;

interface ICartProps<TData> {
    action: TAction<TData>;
    cart: TCart<FragmentType<typeof Cart_ProductFragment>>;
    open: boolean;
    // discount: { value: number | string; onChange: (_: ChangeEvent) => void };
    onCancelled: () => void;
    onProceeded: (data: TData) => void;
}
/** Cart dialog
 *
 * Opens upon mount, needs to be remounted to reopen.
 */
export const Cart = <TData,>({
    action,
    cart,
    /* discount, */
    onCancelled,
    onProceeded,
}: ICartProps<TData>): ReactElement => {
    const [imperativeProps, close] = useImperativeDialog();
    const [fetching, setFetching] = useState(false);
    const [unspecificError, setUnspecificError] = useState<Error>();

    const selectedCart = useMemo(() => cart.filter(([, q]) => q > 0), [cart]);

    const handleProceed = useCallback(async () => {
        if (fetching) return;
        setFetching(true);
        setUnspecificError(undefined);
        const { data, ...errors } = await action(
            selectedCart.map(mapFst(pipe(gF, pick(["id", "revision"]))))
        );
        setUnspecificError(errors.unspecificError);
        setFetching(false);

        await close();
        if (data) onProceeded(data);
    }, [action, selectedCart, close, fetching, onProceeded]);
    const handleCancel = useCallback(async () => {
        await close();
        onCancelled();
    }, [close, onCancelled]);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Dialog {...imperativeProps} preventOutsideDismiss>
            <DialogTitle>Warenkorb</DialogTitle>
            <DialogContent>
                <CartTable cart={selectedCart} /* discount={discount} */ />
                <Typography theme="error" use="body2">
                    {unspecificError?.message ?? ""}
                </Typography>
            </DialogContent>
            <DialogActions>
                <DialogButton
                    label="Zurück"
                    onClick={() => dispatch(handleCancel())}
                    disabled={useStable(fetching)}
                />
                <DialogButton
                    label="Weiter"
                    onClick={() => dispatch(handleProceed())}
                    disabled={useStable(fetching) || selectedCart.length === 0}
                    isDefaultAction
                    raised
                />
            </DialogActions>
        </Dialog>
    );
};
