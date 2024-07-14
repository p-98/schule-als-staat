import { identity, startsWith } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import { type FC, memo, useState } from "react";
import { useQuery } from "urql";
import { GridCell } from "Components/material/grid";
import { Typography } from "Components/material/typography";
import {
    Card,
    CardActions,
    CardContent,
    CardActionIcons,
    CardActionIcon,
    CardInner,
    CardHeader,
} from "Components/material/card";
import { Dialog } from "Components/material/dialog";

// local
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { GridPage } from "Components/page/page";
import { FallbackText } from "Components/fallbackText/fallbackText";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { Dot } from "Components/dot/dot";
import { ActionCard, TAction } from "Components/actionCard/actionCard";
import {
    ActionButton,
    TAction as TButtonAction,
} from "Components/actionButton/actionButton";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import {
    byCode,
    categorizeError,
    client,
    safeData,
    useCategorizeError,
    useSafeData,
    useStable,
} from "Utility/urql";
import { currency, parseCurrency } from "Utility/data";
import { componentFactory, compareBy } from "Utility/misc";
import { useRemount } from "Utility/hooks/hooks";
import { AddProduct } from "./components/addProduct";

import css from "./products.module.css";

/* Product component
 */

const deleteMutation = graphql(/* GraphQL */ `
    mutation DeleteProductMutation($id: ID!) {
        removeProduct(id: $id)
    }
`);
const deleteAction =
    (id: string): TButtonAction =>
    async () => {
        const result = await client.mutation(deleteMutation, { id });
        const { data, error } = safeData(result);
        categorizeError(error, []);
        return { data: data ? true : undefined, unspecificError: undefined };
    };
const StatsGap = componentFactory({
    className: css["view-product__stats-gap"],
});
const ViewProduct_ProductFragment = graphql(/* GraphQL */ `
    fragment ViewProduct_ProductFragment on Product {
        id
        name
        price
        salesToday
        salesTotal
        salesPerDay
    }
`);
interface ViewProductProps {
    product: FragmentType<typeof ViewProduct_ProductFragment>;
    onEdit?: () => void;
}
const ViewProduct: FC<ViewProductProps> = memo(
    ({ product: _product, onEdit }) => {
        const product = useFragment(ViewProduct_ProductFragment, _product);
        return (
            <CardInner>
                <CardHeader>{product.name}</CardHeader>
                <CardContent>
                    <DisplayInfo label="Preis">
                        {currency(product.price)}
                    </DisplayInfo>
                    <Typography
                        use="body2"
                        theme="textSecondaryOnBackground"
                        className={css["view-product__stats"]}
                    >
                        <span>{product.salesToday} heute</span>
                        <StatsGap />
                        <Dot size={6} />
                        <StatsGap />
                        <span>{product.salesTotal} ges.</span>
                        <StatsGap />
                        <Dot size={6} />
                        <StatsGap />
                        <span>{product.salesPerDay}/Tag</span>
                    </Typography>
                </CardContent>
                <CardActions>
                    <CardActionIcons>
                        <CardActionIcon icon="edit" onClick={onEdit} />
                        <ActionButton
                            action={deleteAction(product.id)}
                            label="Löschen"
                            tag={memo(({ onClick, disabled }) => (
                                <CardActionIcon
                                    icon="delete"
                                    onClick={onClick}
                                    disabled={disabled}
                                />
                            ))}
                        />
                    </CardActionIcons>
                </CardActions>
            </CardInner>
        );
    }
);

const EditProduct_ProductFragment = graphql(/* GraphQL */ `
    fragment EditProduct_ProductFragment on Product {
        id
        name
        price
    }
`);
const editMutation = graphql(/* GraphQL */ `
    mutation EditProductMutation($id: ID!, $product: ProductInput!) {
        editProduct(id: $id, product: $product) {
            id
            name
            price
        }
    }
`);
type EditInputs = [string, number];
const editAction =
    (
        product: ResultOf<typeof EditProduct_ProductFragment>
    ): TAction<[], EditInputs> =>
    async ([name, price]) => {
        if (product.name === name && product.price === price)
            // nothing changed, so don't bother the server
            return { data: [], inputErrors: [undefined, undefined] };

        const result = await client.mutation(editMutation, {
            id: product.id,
            product: { name, price },
        });
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
interface EditProductProps {
    product: FragmentType<typeof EditProduct_ProductFragment>;
    onBack?: () => void;
}
const EditProduct: FC<EditProductProps> = memo(
    ({ product: _product, onBack }) => {
        const product = useFragment(EditProduct_ProductFragment, _product);
        return (
            <ActionCard<[], EditInputs>
                action={editAction(product)}
                inputs={[
                    {
                        label: "Name",
                        type: "text",
                        fromInput: identity,
                        toInput: identity,
                        init: product.name,
                    },
                    {
                        label: "Preis",
                        type: "text",
                        fromInput: parseCurrency,
                        toInput: (_) => currency(_, { unit: "none" }),
                        init: product.price,
                    },
                ]}
                title="Bearbeiten"
                confirmButton={{
                    label: "Bearbeiten",
                    raised: true,
                    danger: true,
                }}
                onSuccess={onBack}
                cancelButton={{ label: "Zurück" }}
                onCancel={onBack}
                inner
            />
        );
    }
);

const Product_ProductFragment = graphql(/* GraphQL */ `
    fragment Product_ProductFragment on Product {
        ...ViewProduct_ProductFragment
        ...EditProduct_ProductFragment
    }
`);
interface ProductProps {
    product: FragmentType<typeof Product_ProductFragment>;
}
const Product: FC<ProductProps> = ({ product: _product }) => {
    const product = useFragment(Product_ProductFragment, _product);
    const [edit, setEdit] = useState(false);
    const [editKey, remountEdit] = useRemount();
    return (
        <>
            <Card>
                <ViewProduct product={product} onEdit={() => setEdit(true)} />
            </Card>
            <Dialog
                open={edit}
                onClose={() => setEdit(false)}
                onClosed={remountEdit}
            >
                <EditProduct
                    key={editKey}
                    product={product}
                    onBack={() => setEdit(false)}
                />
            </Dialog>
        </>
    );
};

/* Main component
 */

const UnexpectedError: FC = memo(() => (
    <FallbackText icon="error" text="Ein unerwarteter Fehler is aufgetreten." />
));
const Fetching: FC = memo(() => <FallbackText icon="refresh" text="Lädt..." />);

const query = graphql(/* GraphQL */ `
    query ProductsQuery {
        meCompany {
            id
            products {
                id
                name
                ...Product_ProductFragment
            }
        }
    }
`);
export const Products: React.FC = () => {
    const [result] = useQuery({ query });
    const { data, fetching, error } = useSafeData(result);
    const [unexpectedError] = useCategorizeError(error, []);
    if (useStable(fetching)) return <Fetching />;
    if (unexpectedError) return <UnexpectedError />;
    if (!data) return <></>;
    return (
        <>
            <GridPage>
                <DrawerAppBarHandle title="Produktverwaltung" />
                {data.meCompany.products
                    .slice() // create copy of array
                    .sort(compareBy((_) => _.name))
                    .map((product) => (
                        <GridCell span={4} key={product.id}>
                            <Product product={product} />
                        </GridCell>
                    ))}
            </GridPage>
            <AddProduct />
        </>
    );
};
