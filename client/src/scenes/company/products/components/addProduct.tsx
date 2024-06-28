import { identity, startsWith } from "lodash/fp";
import { type FC, useState } from "react";
import { Fab } from "Components/material/fab/fab";
import { Dialog } from "Components/material/dialog";

import { ActionCard, TAction } from "Components/actionCard/actionCard";
import { currency, parseCurrency } from "Utility/data";
import { graphql } from "Utility/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";

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
