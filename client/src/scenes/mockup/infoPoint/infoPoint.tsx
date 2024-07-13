import { type ResultOf } from "@graphql-typed-document-node/core";
import { useState } from "react";
import { GridCell } from "Components/material/grid";
import { cardClassNames } from "Components/material/card";

// local
import { GridPage } from "Components/page/page";
import { FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import {
    adapterFCT,
    InputCredentials,
} from "Components/credentials/inputCredentials";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import { UserInfo, BankAccountInfo } from "Components/dashboard/dashboard";
import {
    graphql,
    makeFragmentData,
    useFragment as getFragment,
} from "Utility/graphql";
import { useCache } from "Utility/hooks/useCache";
import { useRemount, useWillClick } from "Utility/hooks/hooks";
import { UserBanner } from "Components/userBanner/userBanner";

const InfoPoint_UserFragment = graphql(/* GraphQL */ `
    fragment InfoPoint_UserFragment on User {
        type
        id
        ...UserInfo_UserFragment
        ...BankAccountInfo_UserFragment
    }
`);

const _testUser = {
    __typename: "CitizenUser",
    type: "CITIZEN",
    id: "exampleId",
    firstName: "Max",
    lastName: "Mustermann",
    balance: 10,
    redemptionBalance: 10,
} as const;
const testUser = getFragment(
    InfoPoint_UserFragment,
    makeFragmentData(_testUser, InfoPoint_UserFragment)
);

export const InfoPoint: React.FC = () => {
    const [user, setUser] = useState<ResultOf<typeof InfoPoint_UserFragment>>();
    const cachedUser = useCache(user);
    const [userInputKey, remountUserInfo] = useRemount();

    const [willClose, willCloseListeners] = useWillClick();
    const willOpen = !user;
    return (
        <GridPage>
            <DrawerAppBarHandle title="Infopunkt" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <FCT
                    className={cardClassNames}
                    open={!!user}
                    openWillChange={willOpen || willClose}
                    onOpened={remountUserInfo}
                    onClose={adapterFCT.onClose}
                    onClosed={adapterFCT.onClosed}
                    handle={
                        <InputCredentials
                            key={userInputKey}
                            action={() => Promise.resolve({ data: testUser })}
                            scanQr={!user}
                            title="Account wählen"
                            actionSummary={(_user) => (
                                <UserBanner
                                    label="Informationen für"
                                    user={_user}
                                />
                            )}
                            confirmButton={{ label: "Bestätigen" }}
                            onSuccess={setUser}
                        />
                    }
                    fullscreen={
                        <GridPage>
                            <FullscreenAppBarHandle
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...willCloseListeners}
                                render={!!user}
                                onClose={() => setUser(undefined)}
                            />
                            <GridCell desktop={2} tablet={0} phone={0} />
                            <GridCell span={4}>
                                {cachedUser && <UserInfo user={cachedUser} />}
                            </GridCell>
                            <GridCell>
                                {cachedUser && (
                                    <BankAccountInfo user={cachedUser} />
                                )}
                            </GridCell>
                            <GridCell desktop={2} tablet={0} phone={0} />
                        </GridPage>
                    }
                />
            </GridCell>
        </GridPage>
    );
};
