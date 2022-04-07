import { GridCell } from "Components/material/grid";
import { List } from "Components/material/list";
import { useState } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    CardActionButtons,
    CardActionButton,
} from "Components/material/card";

// local
import transactionsSource from "./transactions.data";
import { TransactionListItem } from "./components/transactions";

import styles from "./bankAccountInfo.module.css";

export const AllTransactionsPage: React.FC = () => {
    const [transactions, setTransactions] = useState(
        transactionsSource.slice(-10)
    );

    const loadMoreTransactions = () =>
        setTransactions(transactionsSource.slice(-(transactions.length + 10)));

    return (
        <>
            <GridCell desktop={3} tablet={1} phone={0} />
            <GridCell span={6} phone={4}>
                <Card>
                    <CardHeader>Transaktionen</CardHeader>
                    <CardContent>
                        <List
                            twoLine
                            className={
                                styles["bank-account-info__transactions"]
                            }
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
                                    transactions.length ===
                                    transactionsSource.length
                                }
                                onClick={loadMoreTransactions}
                            >
                                Mehr laden
                            </CardActionButton>
                        </CardActionButtons>
                    </CardActions>
                </Card>
            </GridCell>
        </>
    );
};
