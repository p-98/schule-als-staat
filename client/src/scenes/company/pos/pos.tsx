import { ResultOf } from "@graphql-typed-document-node/core";
import { useQuery } from "urql";
import React, { useState } from "react";
import { Dialog } from "Components/material/dialog";

// local
import { Pos as PosComponent, TAction as TPosAction } from "Components/pos/pos";
import {
    InputCredentials,
    TAction as TCredentialsAction,
} from "Components/credentials/inputCredentials";
import { CartTable } from "Components/pos/components/cart";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { useForceRemount } from "Utility/hooks/forceRemount";
import { graphql } from "Utility/graphql";
import {
    byCode,
    categorizeError,
    client,
    safeData,
    useCategorizeError,
    useSafeData,
    useStable,
} from "Utility/urql";
import { useCache } from "Utility/hooks/useCache";

import styles from "./pos.module.css";

const productsQuery = graphql(/* GraohQL */ `
    query Products_PosQuery {
        meCompany {
            products {
                ...Pos_ProductFragment
            }
        }
    }
`);

const sellMutation = graphql(/* GraphQL */ `
    mutation SellMutation($items: [PurchaseItemInput!]!) {
        sell(purchase: { items: $items }) {
            id
            grossPrice
            items {
                amount
                product {
                    ...Cart_ProductFragment
                }
            }
        }
    }
`);
type TDraft = ResultOf<typeof sellMutation>["sell"];
const sellAction: TPosAction<TDraft> = async (cart) => {
    const result = await client.mutation(sellMutation, {
        items: cart
            .filter(([, q]) => q > 0)
            .map(([p, q]) => ({ product: p, amount: q })),
    });
    const { data, error } = safeData(result);
    categorizeError(error, []);
    return { data: data?.sell, unspecificError: undefined };
};

const PayMutation = graphql(/* GraphQL */ `
    mutation PayPurchaseMutation($id: Int!, $credentials: CredentialsInput!) {
        payPurchaseDraft(id: $id, credentials: $credentials) {
            __typename
        }
    }
`);
const payAction =
    (draft: TDraft): TCredentialsAction<[]> =>
    async (type, id, password) => {
        const result = await client.mutation(PayMutation, {
            id: draft.id,
            credentials: { type, id, password },
        });
        const { data, error } = safeData(result);
        const [passwordError] = categorizeError(error, [
            byCode("WRONG_PASSWORD"),
        ]);
        return { data: data ? [] : undefined, passwordError };
    };

// interface IDiscountInputProps {
//     value: number;
//     onChange: (value: number) => void;
// }
// const DiscountInput: React.FC<IDiscountInputProps> = ({ value, onChange }) => (
//     <CardContent>
//         <TextField
//             type="number"
//             label={`Vergünstigung (in ${config.currencies.virtual.short})`}
//             value={value || ""}
//             id="discount"
//             onChange={(e) => onChange(parseInt(e.currentTarget.value, 10))}
//         />
//     </CardContent>
// );

export const Pos: React.FC = () => {
    const [draft, setDraft] = useState<TDraft>();
    const cachedDraft = useCache(draft);
    const [posKey, remountPos] = useForceRemount();

    const [result] = useQuery({ query: productsQuery });
    const { data, fetching, error } = useSafeData(result);
    useCategorizeError(error, []);
    if (useStable(fetching)) return <div>Loading...</div>;
    if (!data) return <></>;

    const handleSuccess = () => {
        remountPos();
        setDraft(undefined);
    };

    const { products } = data.meCompany;
    return (
        <>
            <DrawerAppBarHandle title="Kasse" />
            <PosComponent
                key={posKey}
                action={sellAction}
                products={products}
                onProceeded={setDraft}
            />
            {cachedDraft && (
                <Dialog open={!!draft} preventOutsideDismiss>
                    <InputCredentials
                        action={payAction(cachedDraft)}
                        cancelButton={{ label: "Zurück" }}
                        onCancel={() => setDraft(undefined)}
                        confirmButton={{ label: "Bezahlen", danger: true }}
                        onSuccess={handleSuccess}
                        title="Bezahlen"
                        actionSummary={
                            <CartTable
                                cart={cachedDraft.items.map((_) => [
                                    _.product,
                                    _.amount,
                                ])}
                            />
                        }
                        className={styles["pos__credentials"]}
                    />
                </Dialog>
            )}
        </>
    );
};
