import { keys, mapValues, startsWith } from "lodash/fp";
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
import {
    adapterFCT,
    InputCredentials,
    type TAction as TActionCr,
} from "Components/credentials/inputCredentials";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { FCT } from "Components/transition/fullscreenContainerTransform/fullscreenContainerTransform";
import { UserBanner } from "Components/userBanner/userBanner";
import { currency, currencyName, parseCurrency } from "Utility/data";
import { graphql } from "Utility/graphql";
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
type CitizenId = string;

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
const changeAction =
    (clerk: CitizenId): TActionCa<Draft, Inputs> =>
    async ([fromCurrency, fromValue, toCurrency]) => {
        const result = await client.mutation(changeMutation, {
            change: { fromCurrency, fromValue, toCurrency, clerk },
        });
        const { data, error } = safeData(result);
        const [fromValueNotPositiveError] = categorizeError(error, [
            byCode("FROM_VALUE_NOT_POSITIVE"),
        ]);
        return {
            data: data ? data.changeCurrencies : undefined,
            inputErrors: [undefined, fromValueNotPositiveError, undefined],
        };
    };
const payMutation = graphql(/* GraphQL */ `
    mutation PayChangeDraft($id: Int!, $credentials: CredentialsInput!) {
        payChangeDraft(id: $id, credentials: $credentials) {
            id
        }
    }
`);
const payAction =
    (draft: Draft): TActionCr<[]> =>
    async (type, id, password) => {
        const result = await client.mutation(payMutation, {
            id: draft.id,
            credentials: { type, id, password },
        });
        const { data, error } = safeData(result);
        const [passwordError] = categorizeError(error, [
            byCode(startsWith("PASSWORD")),
        ]);
        return { data: data ? [] : undefined, passwordError };
    };
interface ChangeCardProps {
    clerk: CitizenId;
}
const Change: FC<ChangeCardProps> = ({ clerk }) => {
    const [draft, setDraft] = useState<Draft>();
    const cachedDraft = useCache(draft);
    const _payAction = useMemo(
        () => cachedDraft && payAction(cachedDraft),
        [cachedDraft]
    );
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
                action={useMemo(() => changeAction(clerk), [clerk])}
                onSuccess={setDraft}
                title="Geldwechsel"
                confirmButton={{ label: "Weiter" }}
            />
            <Dialog open={!!draft} renderToPortal>
                {cachedDraft && (
                    <InputCredentials<[]>
                        action={_payAction!}
                        scanQr={!!draft}
                        cancelButton={{ label: "Abbrechen" }}
                        onCancel={() => setDraft(undefined)}
                        confirmButton={{ label: "Bestätigen", danger: true }}
                        onSuccess={() => setDraft(undefined)}
                        title="Geld wechseln?"
                        actionSummary={<ChangeSummary draft={cachedDraft} />}
                        dialog
                    />
                )}
            </Dialog>
        </>
    );
};

/* Main component
 */

const clerkQuery = graphql(/* GraphQL */ `
    query CheckClerkQuery($id: ID!, $password: String) {
        checkCredentials(
            credentials: { type: CITIZEN, id: $id, password: $password }
        ) {
            __typename
        }
    }
`);
const clerkAction: TActionCr<CitizenId> = async (type, id, password) => {
    const userTypeError = Error("Sachbearbeiter muss ein Bürger sein.");
    if (type !== "CITIZEN") return { unspecificError: userTypeError };

    const result = await client.query(clerkQuery, { id, password });
    const { data, error } = safeData(result);
    const [passwordError] = categorizeError(error, [byCode("WRONG_PASSWORD")]);
    return { data: data ? id : undefined, passwordError };
};
export const Bank: FC = () => {
    const [clerk, setClerk] = useState<CitizenId>();
    const cachedClerk = useCache(clerk);
    const [clerkInputKey, remountClerkInput] = useRemount();

    const [willClose, willCloseListeners] = useWillClick();
    const willOpen = !clerk;
    return (
        <PageGrid>
            <DrawerAppBarHandle title="Geldwechsel" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <FCT
                    className={cn(cardClassNames, css["bank__fct"])}
                    open={!!clerk}
                    openWillChange={willOpen || willClose}
                    onOpened={remountClerkInput}
                    onClose={adapterFCT.onClose}
                    onClosed={adapterFCT.onClosed}
                    handle={
                        <InputCredentials
                            key={clerkInputKey}
                            action={clerkAction}
                            scanQr={!clerk}
                            onSuccess={setClerk}
                            title="Sachbearbeiter Authentifizieren"
                            actionSummary={(user) => (
                                <UserBanner label="Anmelden als" user={user} />
                            )}
                            confirmButton={{ label: "Weiter" }}
                        />
                    }
                    fullscreen={
                        <PageGrid>
                            <FullscreenAppBarHandle
                                // eslint-disable-next-line react/jsx-props-no-spreading
                                {...willCloseListeners}
                                render={!!clerk}
                                onClose={() => setClerk(undefined)}
                            />
                            <GridCell desktop={4} tablet={2} phone={0} />
                            <GridCell span={4}>
                                {!!cachedClerk && (
                                    <Change clerk={cachedClerk} />
                                )}
                            </GridCell>
                        </PageGrid>
                    }
                />
            </GridCell>
        </PageGrid>
    );
};
