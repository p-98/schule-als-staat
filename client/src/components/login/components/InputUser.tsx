import { useCallback, useState } from "react";
import { endsWith } from "lodash/fp";
import {
    CardActions,
    CardActionButton,
    CardContent,
    CardHeader,
    CardInner,
} from "Components/material/card";
import { TextField } from "Components/material/textfield";
import { Select } from "Components/material/select";
import { graphql } from "Utility/graphql";
import { type UserType } from "Utility/graphql/graphql";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import { dispatch } from "Utility/misc";
import { ResultOf } from "@graphql-typed-document-node/core";

const q = graphql(/* GraphQL */ `
    query InputUserQuery($type: UserType!, $id: String!) {
        user(user: { type: $type, id: $id }) {
            __typename
        }
    }
`);

interface IInputUserProps<TQuery extends typeof q>
    extends React.HTMLAttributes<HTMLDivElement> {
    query: TQuery;
    cancelButton: { label: string };
    onCancel: () => void;
    confirmButton: { label: string };
    onSuccess: (user: ResultOf<TQuery>["user"]) => void;
    title: string;
}
export const InputUser = <TQuery extends typeof q>({
    query,
    cancelButton,
    onCancel,
    confirmButton,
    onSuccess,
    title,
    ...restProps
}: IInputUserProps<TQuery>) => {
    const [type, setType] = useState<UserType>("CITIZEN");
    const [id, setId] = useState("");
    const [fetching, setFetching] = useState(false);
    const [invalidId, setInvalidId] = useState<Error>();

    const handleConfirm = useCallback(
        async (_type: UserType, _id: string) => {
            if (fetching) return;
            setFetching(true);
            setInvalidId(undefined);

            const result = await client.query(query, { id: _id, type: _type });
            setFetching(false);

            const { data, error } = safeData(result);
            if (data) onSuccess(data.user);
            const [_invalidId] = categorizeError(error, [
                byCode(endsWith("NOT_FOUND")),
            ]);
            if (_invalidId) setInvalidId(_invalidId);
        },
        [fetching, setFetching, query, onSuccess]
    );

    const handleCancel = useCallback(() => {
        setType("CITIZEN");
        setId("");
        onCancel();
    }, [onCancel]);

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <CardInner {...restProps}>
            <CardHeader>{title}</CardHeader>
            <CardContent>
                <Select
                    id="login__user-type"
                    options={[
                        { label: "Unternehmen", value: "COMPANY" },
                        { label: "Bürger", value: "CITIZEN" },
                        { label: "Gast", value: "GUEST" },
                    ]}
                    label="Benutzerklasse"
                    value={type}
                    onChange={(e) => setType(e.currentTarget.value as UserType)}
                />
                <TextField
                    id="login__user-id"
                    label="Benutzername"
                    value={id}
                    invalid={!!invalidId}
                    helpText={{
                        validationMsg: true,
                        children: invalidId?.message ?? "",
                    }}
                    onChange={(e) => setId(e.currentTarget.value)}
                />
            </CardContent>
            <CardActions dialogLayout>
                <CardActionButton onClick={handleCancel}>
                    {cancelButton.label}
                </CardActionButton>
                <CardActionButton
                    raised
                    disabled={!id}
                    onClick={() => dispatch(handleConfirm(type, id))}
                >
                    {confirmButton.label}
                </CardActionButton>
            </CardActions>
        </CardInner>
    );
};
