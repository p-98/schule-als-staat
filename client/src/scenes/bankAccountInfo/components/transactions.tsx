import { useState } from "react";
import { GridCell } from "Components/material/grid";
import { List } from "Components/material/list";
import {
    CardContent,
    CardHeader,
    CardActions,
    CardActionButtons,
    CardActionButton,
    cardClassNames,
    Card,
} from "Components/material/card";
import { Icon } from "Components/material/icon";
import { Typography } from "Components/material/typography";
import { GridPage } from "Components/page/page";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformHandle,
    FullscreenContainerTransformElement,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { FullscreenAppBarHandle } from "Components/dynamicAppBar/presets";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { Eq_UserFragment } from "Utility/data";
import { TransactionSummary } from "./transactionSummary";
import { TransactionDetails } from "./transactionDetails";

import styles from "../bankAccountInfo.module.css";

const NothingToShow: React.FC = () => (
    <Typography
        className={styles["nothing-to-show"]}
        use="body1"
        theme="textDisabledOnBackground"
    >
        <Icon icon="history" theme="textDisabledOnBackground" />
        Keine Transaktionen bisher.
    </Typography>
);

export const Transaction_TransactionFragment = graphql(/* GraohQL */ `
    fragment Transaction_TransactionFragment on Transaction {
        ...Summary_TransactionFragment
        ...Details_TransactionFragment
    }
`);
interface ITransactionProps {
    transaction: FragmentType<typeof Transaction_TransactionFragment>;
    user: FragmentType<typeof Eq_UserFragment>;
}
const Transaction: React.FC<ITransactionProps> = ({
    transaction: _trx,
    user,
}) => {
    const trx = useFragment(Transaction_TransactionFragment, _trx);
    const [detailsOpen, setDetailsOpen] = useState(false);
    return (
        <>
            <TransactionSummary
                transaction={trx}
                user={user}
                onClick={() => setDetailsOpen(true)}
            />
            <TransactionDetails
                transaction={trx}
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
            />
        </>
    );
};

export const Transactions_UserFragment = graphql(/* GraohQL */ `
    fragment Transactions_UserFragment on User {
        transactions {
            id
            ...Transaction_TransactionFragment
        }
        ...Eq_UserFragment
    }
`);

type TTransactionsCardProps = React.ComponentPropsWithoutRef<typeof Card> & {
    user: FragmentType<typeof Transactions_UserFragment>;
    limit?: number;
    actionButton?: { label: string };
    onAction?: () => void;
};
const TransactionsCard: React.FC<TTransactionsCardProps> = ({
    user: _user,
    limit,
    actionButton,
    onAction,
    ...rest
}) => {
    const user = useFragment(Transactions_UserFragment, _user);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Card {...rest}>
            <CardHeader>Transaktionen</CardHeader>
            <CardContent>
                <List
                    twoLine
                    className={styles["bank-account-info__transactions-card"]}
                >
                    {user.transactions.length === 0 && <NothingToShow />}
                    {user.transactions
                        .slice(-(limit ?? user.transactions.length))
                        .reverse()
                        .map((trx) => (
                            <Transaction
                                transaction={trx}
                                user={user}
                                key={`${trx.__typename}${trx.id}`}
                            />
                        ))}
                </List>
            </CardContent>
            {actionButton && (
                <CardActions>
                    <CardActionButtons>
                        <CardActionButton onClick={onAction}>
                            {actionButton.label}
                        </CardActionButton>
                    </CardActionButtons>
                </CardActions>
            )}
        </Card>
    );
};

export interface ITransactionsProps {
    user: FragmentType<typeof Transactions_UserFragment>;
}
export const Transactions: React.FC<ITransactionsProps> = ({ user }) => {
    const [allOpen, setAllOpen] = useState(false);
    return (
        <FullscreenContainerTransform
            open={allOpen}
            expectTransformation={false}
            className={cardClassNames}
            openClassName={
                styles["bank-account-info__fullscreen-container--open"]
            }
        >
            <FullscreenContainerTransformHandle>
                <TransactionsCard
                    user={user}
                    limit={5}
                    actionButton={{ label: "Alle anzeigen" }}
                    onAction={() => setAllOpen(true)}
                />
            </FullscreenContainerTransformHandle>
            <FullscreenContainerTransformElement>
                <GridPage>
                    <FullscreenAppBarHandle
                        onClose={() => setAllOpen(false)}
                        render={allOpen}
                    />
                    <GridCell desktop={3} tablet={1} phone={0} />
                    <GridCell span={6} phone={4}>
                        <TransactionsCard user={user} />
                    </GridCell>
                </GridPage>
            </FullscreenContainerTransformElement>
        </FullscreenContainerTransform>
    );
};
