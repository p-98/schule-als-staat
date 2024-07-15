import { endsWith, keys, mapValues, startsWith } from "lodash/fp";
import { type ResultOf } from "@graphql-typed-document-node/core";
import cn from "classnames";
import { FC, memo, useMemo, useState } from "react";
import { Dialog } from "Components/material/dialog";
import { GridCell } from "Components/material/grid";
import { cardClassNames } from "Components/material/card/card";

import {
    ActionCard,
    type TAction as TActionCa,
} from "Components/actionCard/actionCard";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import {
    InputUser,
    adapterFCT,
    type TKbAction,
    type TQrAction,
} from "Components/credentials/inputUser";
import { BankAccountInfo } from "Components/dashboard/bankAccountInfo";
import {
    InputPassword,
    TAction as TActionPw,
} from "Components/credentials/inputPassword";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import { UserInfo } from "Components/dashboard/userInfo";
import { UserType } from "Utility/graphql/graphql";
import { currency, currencyName, parseCurrency } from "Utility/data";
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
    useFragment,
} from "Utility/graphql";
import { useRemount, useWillClick } from "Utility/hooks/hooks";
import { useCache } from "Utility/hooks/useCache";
import { byCode, categorizeError, client, safeData } from "Utility/urql";
import config from "Config";

import css from "./bank.module.css";

/** A random currency other than the main currency.
 *
 * Falls back to main currency if there is none.
 */
const secondaryCurrency =
    keys(config.currencies).find((_) => _ !== config.mainCurrency) ??
    config.mainCurrency;
type Draft = ResultOf<typeof changeMutation>["changeCurrencies"];

/* Helper component
 */

const ChangeSummary: FC<{ draft: Draft }> = memo(({ draft }) => (
    <>
        <DisplayInfo label="Von Währung">
            {currencyName(draft.fromCurrency)}
        </DisplayInfo>
        <DisplayInfo label="Von Betrag">
            {currency(draft.fromValue, { currency: draft.fromCurrency })}
        </DisplayInfo>
        <DisplayInfo label="Zu Währung">
            {currencyName(draft.toCurrency)}
        </DisplayInfo>
        <DisplayInfo label="Zu Betrag">
            {currency(draft.toValue, { currency: draft.toCurrency })}
        </DisplayInfo>
    </>
));

type Inputs = [string, number, string];
const changeMutation = graphql(/* GraphQL */ `
    mutation ChangeCurrenciesMutation($change: ChangeInput!) {
        changeCurrencies(change: $change) {
            id
            fromCurrency
            fromValue
            toCurrency
            toValue
        }
    }
`);
const changeAction: TActionCa<Draft, Inputs> = async ([
    fromCurrency,
    fromValue,
    toCurrency,
]) => {
    const result = await client.mutation(changeMutation, {
        change: { fromCurrency, fromValue, toCurrency, clerk: null },
    });
    const { data, error } = safeData(result);
    const [fromValueNotPositiveError, sameCurrenciesError] = categorizeError(
        error,
        [byCode("FROM_VALUE_NOT_POSITIVE"), byCode("TO_CURRENCY_SAME_AS_FROM")]
    );
    return {
        data: data ? data.changeCurrencies : undefined,
        inputErrors: [
            undefined,
            fromValueNotPositiveError,
            sameCurrenciesError,
        ],
        unspecificError: undefined,
    };
};
const payMutation = graphql(/* GraphQL */ `
    mutation PayChangeDraft($id: Int!, $credentials: CredentialsInput!) {
        payChangeDraft(id: $id, credentials: $credentials) {
            id
        }
    }
`);
type UserSignature = { type: UserType; id: string };
const payAction =
    (draft: Draft, { type, id }: UserSignature): TActionPw<[]> =>
    async (password) => {
        const result = await client.mutation(payMutation, {
            id: draft.id,
            credentials: { type, id, password },
        });
        const { data, error } = safeData(result);
        const [passwordError, balanceTooLowError] = categorizeError(error, [
            byCode(startsWith("PASSWORD")),
            byCode("BALANCE_TOO_LOW"),
        ]);
        return {
            data: data ? [] : undefined,
            passwordError,
            unspecificError: balanceTooLowError,
        };
    };
const Change_UserFragment = graphql(/* GraphQL */ `
    fragment Change_UserFragment on User {
        type
        id
    }
`);
interface ChangeCardProps {
    user: FragmentType<typeof Change_UserFragment>;
}
const Change: FC<ChangeCardProps> = ({ user: _user }) => {
    const user = useFragment(Change_UserFragment, _user);
    const [draft, setDraft] = useState<Draft>();
    const cachedDraft = useCache(draft);
    const _payAction = useMemo(
        () => cachedDraft && payAction(cachedDraft, user),
        [cachedDraft, user]
    );
    const [inputPasswordKey, remountInputPassword] = useRemount();
    return (
        <>
            <ActionCard<Draft, Inputs>
                inputs={[
                    {
                        label: "Von Währung",
                        type: "select",
                        options: mapValues((_) => _.name, config.currencies),
                        init: config.mainCurrency,
                    },
                    {
                        label: "Von Betrag",
                        type: "text",
                        toInput: (_) => currency(_, { unit: "none" }),
                        fromInput: parseCurrency,
                        init: 0,
                    },
                    {
                        label: "Zu Währung",
                        type: "select",
                        options: mapValues((_) => _.name, config.currencies),
                        init: secondaryCurrency,
                    },
                ]}
                action={changeAction}
                onSuccess={setDraft}
                title="Geldwechsel"
                confirmButton={{ label: "Weiter" }}
            />
            <Dialog
                open={!!draft}
                renderToPortal
                onClosed={remountInputPassword}
                preventOutsideDismiss
            >
                {cachedDraft && (
                    <InputPassword<[]>
                        key={inputPasswordKey}
                        action={_payAction!}
                        cancelButton={{ label: "Abbrechen" }}
                        onCancel={() => setDraft(undefined)}
                        confirmButton={{ label: "Bestätigen", danger: true }}
                        onSuccess={() => setDraft(undefined)}
                        title="Geldwechsel autorisieren"
                        actionSummary={<ChangeSummary draft={cachedDraft} />}
                        id="change__password"
                    />
                )}
            </Dialog>
        </>
    );
};

/* Main component
 */

const Bank_UserFragment = graphql(/* GraphQL */ `
    fragment Bank_UserFragment on User {
        ...UserInfo_UserFragment
        ...BankAccountInfo_UserFragment
        ...Change_UserFragment
    }
`);
const userQrQuery = graphql(/* GraphQL */ `
    query BankQrUserQuery($id: ID!) {
        readCard(id: $id) {
            ...Bank_UserFragment
        }
    }
`);
const userKbQuery = graphql(/* GraphQL */ `
    query BankKbUserQuery($type: UserType!, $id: String!) {
        user(user: { type: $type, id: $id }) {
            ...Bank_UserFragment
        }
    }
`);
const userQrAction: TQrAction<ResultOf<typeof Bank_UserFragment>> = async (
    id
) => {
    const result = await client.query(userQrQuery, { id });
    const { data, error } = safeData(result);
    const [notFoundError] = categorizeError(error, [
        byCode(endsWith("CARD_NOT_FOUND")),
    ]);
    const noUserError =
        data && data.readCard === null ? new Error("Karte leer.") : undefined;
    return {
        data:
            data && !noUserError
                ? getFragment(Bank_UserFragment, data.readCard!)
                : undefined,
        unspecificError: notFoundError ?? noUserError,
    };
};
const userKbAction: TKbAction<ResultOf<typeof Bank_UserFragment>> = async (
    type,
    id
) => {
    const result = await client.query(userKbQuery, { type, id });
    const { data, error } = safeData(result);
    const [notFoundError] = categorizeError(error, [
        byCode(endsWith("NOT_FOUND")),
    ]);
    return {
        data: data ? getFragment(Bank_UserFragment, data.user) : undefined,
        idError: notFoundError,
    };
};
export const Bank: FC = () => {
    const [user, setUser] = useState<ResultOf<typeof Bank_UserFragment>>();
    const cachedUser = useCache(user);
    const [inputUserKey, remountInputUser] = useRemount();

    const [willClose, willCloseListeners] = useWillClick();
    const willOpen = !user;
    return (
        <PageGrid>
            <DrawerAppBarHandle title="Geldwechsel" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <FCT
                    className={cn(cardClassNames, css["bank__fct"])}
                    open={!!user}
                    openWillChange={willOpen || willClose}
                    onOpened={remountInputUser}
                    onClose={adapterFCT.onClose}
                    onClosed={adapterFCT.onClosed}
                    handle={
                        <InputUser
                            key={inputUserKey}
                            qrAction={userQrAction}
                            kbAction={userKbAction}
                            scanQr={!user}
                            confirmButton={{ label: "Weiter" }}
                            onSuccess={setUser}
                            title="Kunde eingeben"
                        />
                    }
                    fullscreen={
                        <PageGrid>
                            <FullscreenAppBarHandle
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...willCloseListeners}
                                render={!!user}
                                onClose={() => setUser(undefined)}
                            />
                            <GridCell desktop={2} tablet={0} phone={0} />
                            <GridCell span={4}>
                                {cachedUser && (
                                    <GridScrollColumn desktop tablet>
                                        <UserInfo user={cachedUser} />
                                        <BankAccountInfo user={cachedUser} />
                                    </GridScrollColumn>
                                )}
                            </GridCell>
                            <GridCell span={4}>
                                {cachedUser && <Change user={cachedUser} />}
                            </GridCell>
                        </PageGrid>
                    }
                />
            </GridCell>
        </PageGrid>
    );
};
