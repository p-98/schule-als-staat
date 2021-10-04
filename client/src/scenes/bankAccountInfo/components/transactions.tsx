import { SimpleListItem } from "@rmwc/list";
import React, { useState } from "react";
import cn from "classnames";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
import "@material/ripple/dist/mdc.ripple.css";

// list imports
import "@material/list/dist/mdc.list.css";
// import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { CardContent } from "Components/card/card";
import { SimpleDialog } from "Components/dialog/dialog";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { ITransaction } from "Utility/types";
import { generateListItemInfo } from "../util/listItemInfo";
import { generateTransactionDetails } from "../util/transactionDetails";
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
        cancel={{ label: "Schließen", handler: onClose }}
        title="Details"
    >
        <CardContent>
            {Object.entries(generateTransactionDetails(transaction)).map(
                ([label, content]) => (
                    <DisplayInfo label={label} key={label}>
                        {content}
                    </DisplayInfo>
                )
            )}
        </CardContent>
    </SimpleDialog>
);

export interface ITransactionListItemInfo {
    infoText: string;
    type: string;
    icon: string;
    balance: number;
}
export interface ITransactionListItemProps {
    transaction: ITransaction;
}
export const TransactionListItem: React.FC<ITransactionListItemProps> = ({
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
