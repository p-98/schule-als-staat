import { List, SimpleListItem } from "@rmwc/list";
import { SimpleDialog } from "@rmwc/dialog";
import React, { useState } from "react";
import cn from "classnames";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import {
    Card,
    CardContent,
    CardHeader,
    CardActions,
    CardActionButtons,
    CardActionButton,
} from "Components/card/card";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { ITransaction } from "Utility/types";
import { generateListItemInfo } from "../util/listItemInfo";
import { generateTransactionDetails } from "../util/transactionDetails";
import transactions from "../transactions.data";
import { parseCurrency } from "../util/parseCurrency";

import styles from "../bankAccountInfo.module.css";

export type TTransactionDetails = { [info: string]: string };
interface IDetailDialogProps {
    open: boolean;
    onClose: () => void;
    transaction: ITransaction;
}
const DetailDialog: React.FC<IDetailDialogProps> = ({
    open,
    onClose,
    transaction,
}) => (
    <SimpleDialog
        open={open}
        onClose={onClose}
        acceptLabel="Test"
        cancelLabel="Schließen"
        title="Details"
    >
        {/* <CardContent>
            {Object.entries(generateTransactionDetails(transaction)).map(
                ([label, content]) => (
                    <DisplayInfo label={label} key={label}>
                        {content}
                    </DisplayInfo>
                )
            )}
        </CardContent> */}
    </SimpleDialog>
);

export interface ITransactionListItemInfo {
    infoText: string;
    type: string;
    icon: string;
    balance: number;
}
interface ITransactionListItemProps {
    transaction: ITransaction;
}
const TransactionListItem: React.FC<ITransactionListItemProps> = ({
    transaction,
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const { infoText, type, icon, balance } = generateListItemInfo(transaction);

    const sign = balance < 0 ? "-" : "+";

    return (
        <>
            <SimpleListItem
                className={cn(
                    styles["bank-account-info__transaction-list-item"],
                    styles[
                        balance < 0
                            ? "bank-account-info__transaction-list-item--negative"
                            : "bank-account-info__transaction-list-item--positive"
                    ]
                )}
                onClick={() => setShowDetails(true)}
                text={infoText}
                secondaryText={type}
                graphic={icon}
                meta={sign + parseCurrency(Math.abs(balance))}
            />
            <DetailDialog
                open={showDetails}
                onClose={() => setShowDetails(false)}
                transaction={transaction}
            />
        </>
    );
};

export const Transactions: React.FC = () => (
    <Card>
        <CardHeader>Transaktionen</CardHeader>
        <CardContent>
            <List twoLine className={styles["bank-account-info__transactions"]}>
                {transactions.map((transaction) => (
                    <TransactionListItem
                        transaction={transaction}
                        key={transaction.id}
                    />
                ))}
            </List>
        </CardContent>
        <CardActions>
            <CardActionButtons>
                <CardActionButton>Mehr anzeigen</CardActionButton>
            </CardActionButtons>
        </CardActions>
    </Card>
);
