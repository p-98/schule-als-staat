import { ResultOf } from "@graphql-typed-document-node/core";
import { useMemo } from "react";
import { join, map } from "lodash/fp";
import { CardContent } from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { pipe1 } from "Utility/misc";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { bool, currency, currencyName, name } from "Utility/data";

export const Details_TransactionFragment = graphql(/* GraohQL */ `
    fragment Details_TransactionFragment on Transaction {
        date
        ... on TransferTransaction {
            sender {
                id
                ...Name_UserFragment
            }
            receiver {
                id
                ...Name_UserFragment
            }
            value
            purpose
        }
        ... on ChangeTransaction {
            user {
                id
                ...Name_UserFragment
            }
            fromCurrency
            fromValue
            toCurrency
            toValue
        }
        ... on PurchaseTransaction {
            customer {
                id
                ...Name_UserFragment
            }
            company {
                id
                ...Name_UserFragment
            }
            grossPrice
            netPrice
            tax
            items {
                amount
                product {
                    id
                    name
                }
            }
            discount
        }
        ... on CustomsTransaction {
            user {
                id
                ...Name_UserFragment
            }
            customs
        }
        ... on SalaryTransaction {
            employment {
                id
                company {
                    id
                    ...Name_UserFragment
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

type TTransactionDetails = { [info: string]: string };
const detailFactories: {
    [K in ResultOf<typeof Details_TransactionFragment>["__typename"]]: (
        trx: ResultOf<typeof Details_TransactionFragment> & {
            __typename: K;
        }
    ) => TTransactionDetails;
} = {
    TransferTransaction: (trx) => ({
        Zeitpunkt: trx.date,
        Transaktionsart: "Überweisung",
        Betrag: currency(trx.value),
        Sender: name(trx.sender),
        Empfänger: name(trx.receiver),
        Verwendungszweck: trx.purpose ?? "-",
    }),
    ChangeTransaction: (trx) => {
        const from = currency(trx.fromValue, { currency: trx.fromCurrency });
        const to = currency(trx.toValue, { currency: trx.toCurrency });
        return {
            Zeitpunkt: trx.date,
            Transaktionsart: "Wechsel",
            [`Bezahlt in ${currencyName(trx.fromCurrency)}`]: from,
            [`Bezhalt in ${currencyName(trx.toCurrency)}`]: to,
        };
    },
    PurchaseTransaction: (trx) => ({
        Zeitpunkt: trx.date,
        Transaktionsart: "Kauf",
        Käufer: name(trx.customer),
        Verkäufer: name(trx.company),
        "Preis brutto": currency(trx.grossPrice),
        "Preis netto": currency(trx.netPrice),
        Steuern: currency(trx.tax),
        Rabatt: currency(trx.discount ?? 0),
        Produkte: pipe1(
            trx.items,
            map((_) => `${_.amount}x ${_.product.name}`),
            join(", ")
        ),
    }),
    CustomsTransaction: (trx) => ({
        Zeitpunkt: trx.date,
        Transaktionsart: "Zoll",
        Betroffen: name(trx.user),
        Gebühren: currency(trx.customs),
    }),
    SalaryTransaction: (trx) => ({
        Zeitpunkt: trx.date,
        Transaktionsart: "Gehaltsauszahlung",
        Arbeitgeber: name(trx.employment.company),
        Arbeitnehmer: name(trx.employment.citizen),
        "Gehalt brutto": currency(trx.grossValue),
        "Gehalt netto": currency(trx.netValue),
        Steuern: currency(trx.tax),
        Bonusauszahlung: bool(trx.isBonus),
        "Arbeitszeit Start": trx.worktime?.start ?? "-",
        "Arbeitszeit Ende": trx.worktime?.end ?? "-",
    }),
};

export interface ITransactionDetailsProps {
    transaction: FragmentType<typeof Details_TransactionFragment>;
    open: boolean;
    onClose: () => void;
}
export const TransactionDetails: React.FC<ITransactionDetailsProps> = ({
    transaction: _trx,
    open,
    onClose,
}) => {
    const trx = useFragment(Details_TransactionFragment, _trx);
    // @ts-expect-error Typescript is not able to see that always the correct transaction is passed
    const details = useMemo(() => detailFactories[trx.__typename](trx), [trx]);
    return (
        <SimpleDialog
            open={open}
            cancel={{ label: "Schließen", onCancel: onClose }}
            title="Details"
        >
            <CardContent>
                {Object.entries(details).map(([label, content]) => (
                    <DisplayInfo label={label} key={label}>
                        {content}
                    </DisplayInfo>
                ))}
            </CardContent>
        </SimpleDialog>
    );
};
