import { ResultOf } from "@graphql-typed-document-node/core";
import React, { useMemo } from "react";
import cn from "classnames";
import config from "Config";
import { SimpleListItem } from "Components/material/list";
import {
    FragmentType,
    graphql,
    makeFragmentData,
    useFragment,
} from "Utility/graphql";
import {
    currency,
    currencyName,
    Eq_UserFragment,
    name,
    userEq,
} from "Utility/data";

import styles from "../bankAccountInfo.module.css";

const bank = makeFragmentData(
    {
        __typename: "CompanyUser",
        type: "COMPANY" as const,
        id: config.roles.bankCompanyId,
    },
    Eq_UserFragment
);

export const Summary_TransactionFragment = graphql(/* GraohQL */ `
    fragment Summary_TransactionFragment on Transaction {
        ... on TransferTransaction {
            sender {
                id
                ...Name_UserFragment
                ...Eq_UserFragment
            }
            receiver {
                id
                ...Name_UserFragment
            }
            value
            purpose
        }
        ... on ChangeTransaction {
            fromCurrency
            fromValue
            toCurrency
            toValue
        }
        ... on PurchaseTransaction {
            customer {
                id
                ...Name_UserFragment
                ...Eq_UserFragment
            }
            company {
                id
                ...Name_UserFragment
            }
            grossPrice
            netPrice
        }
        ... on CustomsTransaction {
            user {
                id
                ...Name_UserFragment
                ...Eq_UserFragment
            }
            customs
        }
        ... on SalaryTransaction {
            employment {
                id
                company {
                    id
                    ...Name_UserFragment
                    ...Eq_UserFragment
                }
                citizen {
                    id
                    ...Name_UserFragment
                }
            }
            grossValue
            netValue
            tax
            worktime {
                id
                start
                end
            }
            isBonus
        }
    }
`);

type TTransactionSummary = {
    icon: string;
    type: string;
    summary: string;
    value: number;
};
const summaryFactories: {
    [K in ResultOf<typeof Summary_TransactionFragment>["__typename"]]: (
        user: FragmentType<typeof Eq_UserFragment>,
        trx: ResultOf<typeof Summary_TransactionFragment> & {
            __typename: K;
        }
    ) => TTransactionSummary;
} = {
    TransferTransaction: (user, trx) => {
        const isSender = userEq(user, trx.sender);
        return {
            icon: isSender ? "upload" : "download",
            type: `Überweisung ${isSender ? "an" : "von"} ${
                isSender ? name(trx.receiver) : name(trx.sender)
            }`,
            summary: trx.purpose ?? "(Ohne Betreff)",
            value: isSender ? -trx.value : +trx.value,
        };
    },
    ChangeTransaction: (user, trx) => {
        const fromCurrencyName = currencyName(trx.fromCurrency);
        const toCurrencyName = currencyName(trx.toCurrency);
        const value = (() => {
            if (userEq(user, bank) && trx.fromCurrency === config.mainCurrency)
                return +trx.fromValue;
            if (userEq(user, bank) && trx.toCurrency === config.mainCurrency)
                return -trx.toValue;
            if (trx.fromCurrency === config.mainCurrency) return -trx.fromValue;
            if (trx.toCurrency === config.mainCurrency) return trx.toValue;
            return 0;
        })();
        return {
            icon: "swap_horiz",
            type: "Wechsel",
            summary: `${fromCurrencyName} zu ${toCurrencyName}`,
            value,
        };
    },
    PurchaseTransaction: (user, trx) => {
        const isCustomer = userEq(user, trx.customer);
        return {
            icon: "shopping_cart",
            type: isCustomer ? "Einkauf" : "Verkauf",
            summary: isCustomer ? name(trx.company) : name(trx.customer),
            value: isCustomer ? -trx.grossPrice : +trx.netPrice,
        };
    },
    CustomsTransaction: (user, trx) => {
        const isBorderControl = !userEq(user, trx.user);
        return {
            icon: "import_export",
            type: "Zoll",
            summary: isBorderControl ? name(trx.user) : "Zollbebühren",
            value: isBorderControl ? +trx.customs : -trx.customs,
        };
    },
    SalaryTransaction: (user, trx) => {
        const isCompany = userEq(user, trx.employment.company);
        return {
            icon: "payments",
            type: "Gehalt",
            summary: isCompany
                ? name(trx.employment.citizen)
                : name(trx.employment.company),
            value: isCompany ? -trx.grossValue : +trx.netValue,
        };
    },
};

interface ITransactionSummaryProps {
    transaction: FragmentType<typeof Summary_TransactionFragment>;
    user: FragmentType<typeof Eq_UserFragment>;
    onClick: () => void;
}
export const TransactionSummary: React.FC<ITransactionSummaryProps> = ({
    transaction: _trx,
    user,
    onClick,
}) => {
    const trx = useFragment(Summary_TransactionFragment, _trx);
    const summary = useMemo(
        // @ts-expect-error Typescript cant see that always a correct transaction is passed
        () => summaryFactories[trx.__typename](user, trx),
        [user, trx]
    );
    const sign = summary.value < 0 ? "-" : "+";
    return (
        <SimpleListItem
            className={cn(
                styles["bank-account-info__transaction-summary"],
                styles[
                    summary.value < 0
                        ? "bank-account-info__transaction-summary--negative"
                        : "bank-account-info__transaction-summary--positive"
                ]
            )}
            onClick={onClick}
            text={summary.summary}
            secondaryText={summary.type}
            graphic={summary.icon}
            meta={sign + currency(Math.abs(summary.value))}
        />
    );
};
