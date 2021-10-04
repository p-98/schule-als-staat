import { GridCell } from "@rmwc/grid";
import { List } from "@rmwc/list";
import { useState } from "react";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    CardActionButtons,
    CardActionButton,
} from "Components/card/card";
import transactionsSource from "./transactions.data";
import { TransactionListItem } from "./components/transactions";

import styles from "./bankAccountInfo.module.css";

const TransactionsCard: React.FC = () => {
    const [transactions, setTransactions] = useState(
        transactionsSource.slice(-10)
    );

    const loadMoreTransactions = () =>
        setTransactions(transactionsSource.slice(-(transactions.length + 10)));

    return (
        <Card>
            <CardHeader>Transaktionen</CardHeader>
            <CardContent>
                <List
                    twoLine
                    className={styles["bank-account-info__transactions"]}
                >
                    {transactions
                        .slice()
                        .reverse()
                        .map((transaction) => (
                            <TransactionListItem
                                transaction={transaction}
                                key={transaction.id}
                            />
                        ))}
                </List>
            </CardContent>
            <CardActions>
                <CardActionButtons>
                    <CardActionButton
                        disabled={
                            transactions.length === transactionsSource.length
                        }
                        onClick={loadMoreTransactions}
                    >
                        Mehr laden
                    </CardActionButton>
                </CardActionButtons>
            </CardActions>
        </Card>
    );
};

/** A page for displaying all transactions */
export const Transactions: React.FC = () => (
    <PageGrid>
        <GridCell desktop={3} tablet={1} phone={0} />
        <GridCell span={6} phone={4}>
            <TransactionsCard />
        </GridCell>
    </PageGrid>
);
