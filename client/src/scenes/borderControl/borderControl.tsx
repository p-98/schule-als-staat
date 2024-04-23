import { useCallback, useMemo, useState } from "react";
import { GridCell } from "Components/material/grid";
import { Card } from "Components/material/card";

// local
import { GridPage } from "Components/page/page";
import { GetUser } from "Components/login/getUser";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { Nullable } from "Utility/types";
import { CreateGuest, RemoveGuest } from "./components/guestDialog";
import { ChargeCitizen } from "./components/citizenDialog";
import { ChargeCompany } from "./components/companyDialog";

const BorderControl_UserFragment = graphql(/* GraphQL */ `
    fragment BorderControl_UserFragment on User {
        ... on GuestUser {
            ...BorderControl_GuestUserFragment
        }
        ... on CitizenUser {
            ...BorderControl_CitizenUserFragment
        }
        ... on CompanyUser {
            ...BorderControl_CompanyUserFragment
        }
    }
`);

const queries = {
    qr: graphql(/* GraohQL */ `
        query Qr__BorderControlQuery($id: ID!) {
            readCard(id: $id) {
                ...BorderControl_UserFragment
            }
        }
    `),
    keyboard: graphql(/* GraphQL */ `
        query Keyboard__BorderControlQuery($type: UserType!, $id: String!) {
            user(user: { type: $type, id: $id }) {
                ...BorderControl_UserFragment
            }
        }
    `),
};

export const BorderControl: React.FC = () => {
    const [data, setData] = useState<{
        // null indicates an empty card
        user: Nullable<FragmentType<typeof BorderControl_UserFragment>>;
        // undefined indicates manual input
        cardId: string | undefined;
    }>();
    const resetData = useCallback(() => setData(undefined), [setData]);

    const dialog = useMemo(() => {
        if (!data) return undefined;
        const { user: _user, cardId } = data;
        const user = getFragment(BorderControl_UserFragment, _user);
        switch (user?.__typename) {
            case undefined:
                if (!cardId) throw Error("bc: cardId undefined");
                return (
                    <CreateGuest
                        cardId={cardId}
                        onCancelled={resetData}
                        onSucceeded={resetData}
                        key={new Date().toUTCString()}
                    />
                );
            case "GuestUser":
                if (!cardId) throw Error("bc: cardId undefined");
                return (
                    <RemoveGuest
                        cardId={cardId}
                        guest={user}
                        onCancelled={resetData}
                        onSucceeded={resetData}
                        key={new Date().toUTCString()}
                    />
                );
            case "CitizenUser":
                return (
                    <ChargeCitizen
                        citizen={user}
                        onCancelled={resetData}
                        onSucceeded={resetData}
                        key={new Date().toUTCString()}
                    />
                );
            case "CompanyUser":
                return (
                    <ChargeCompany
                        company={user}
                        onCancelled={resetData}
                        onSucceeded={resetData}
                        key={new Date().toUTCString()}
                    />
                );
        }
    }, [data, resetData]);

    return (
        <GridPage>
            <DrawerAppBarHandle title="Grenzkontrolle" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell>
                <Card>
                    <GetUser
                        queries={queries}
                        allowEmpty
                        title="Grenzkontrolle"
                        confirmButton={{ label: "Bestätigen" }}
                        onSuccess={(user, cardId) => setData({ user, cardId })}
                    />
                </Card>
                {dialog}
            </GridCell>
        </GridPage>
    );
};
