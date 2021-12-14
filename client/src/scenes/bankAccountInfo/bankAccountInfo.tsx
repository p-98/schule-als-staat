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
import { GridPage } from "Components/page/page";
import { BankAccountInfo as BasicBankAccountInfo } from "Components/dashboard/dashboard";
import {
    CardInner,
    CardContent,
    CardHeader,
    CardActions,
    CardActionButtons,
    CardActionButton,
    cardClassNames,
} from "Components/card/card";
import {
    FullscreenContainerTransform,
    FullscreenContainerTransformHandle,
    FullscreenContainerTransformElement,
} from "Components/transition/containerTransform/fullscreen/fullscreenContainerTransform";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import {
    DrawerAppBarHandle,
    FullscreenAppBarHandle,
} from "Components/dynamicAppBar/presets";
import transactions from "./transactions.data";
import { TransactionListItem } from "./components/transactions";
import { AllTransactionsPage } from "./transactions";

import styles from "./bankAccountInfo.module.css";

interface ITransactionsCardProps extends React.HTMLAttributes<HTMLDivElement> {
    onShowAll: () => void;
}
const TransactionsCard: React.FC<ITransactionsCardProps> = ({
    onShowAll,
    ...restProps
}) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <CardInner {...restProps}>
        <CardHeader>Transaktionen</CardHeader>
        <CardContent>
            <List twoLine className={styles["bank-account-info__transactions"]}>
                {transactions
                    .slice(-5)
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
                <CardActionButton onClick={onShowAll}>
                    Alle anzeigen
                </CardActionButton>
            </CardActionButtons>
        </CardActions>
    </CardInner>
);

export const BankAccountInfo: React.FC = () => {
    const [showAllTransactions, setShowAllTransactions] = useState(false);

    return (
        <GridPage>
            <DrawerAppBarHandle title="Bankkonto" />
            <GridCell desktop={1} tablet={1} phone={0} />
            <GridCell span={4} tablet={6}>
                <GridScrollColumn desktop>
                    <BasicBankAccountInfo />
                </GridScrollColumn>
            </GridCell>
            <GridCell desktop={0} tablet={1} phone={0} />
            <GridCell desktop={0} tablet={1} phone={0} />
            <GridCell desktop={6} tablet={6} phone={4}>
                <GridScrollColumn desktop>
                    <FullscreenContainerTransform
                        open={showAllTransactions}
                        expectTransformation={false}
                        className={cardClassNames}
                        openClassName={
                            styles[
                                "bank-account-info__fullscreen-container--open"
                            ]
                        }
                    >
                        <FullscreenContainerTransformHandle>
                            <TransactionsCard
                                onShowAll={() => setShowAllTransactions(true)}
                            />
                        </FullscreenContainerTransformHandle>
                        <FullscreenContainerTransformElement>
                            <GridPage>
                                <FullscreenAppBarHandle
                                    onClose={() =>
                                        setShowAllTransactions(false)
                                    }
                                    render={showAllTransactions}
                                />
                                <AllTransactionsPage />
                            </GridPage>
                        </FullscreenContainerTransformElement>
                    </FullscreenContainerTransform>
                </GridScrollColumn>
            </GridCell>
        </GridPage>
    );
};
