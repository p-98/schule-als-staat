import { GridCell } from "@rmwc/grid";
import { TextField } from "@rmwc/textfield";
import { Dialog } from "@rmwc/dialog";
import React, { useContext, useState } from "react";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// dialog imports
import "@material/dialog/dist/mdc.dialog.css";
import "@material/button/dist/mdc.button.css";
// import "@material/ripple/dist/mdc.ripple.css";

// local
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    CardActionButton,
} from "Components/card/card";
import { AuthUser } from "Components/login/authUser";
import config from "Config";
import { TOnAuthUser } from "Components/login/types";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { BankUserContext } from "../util/context";
import { CheckoutSummary } from "./checkoutSummary";
import type { IChangeCurrenciesInfo } from "../types";

interface IAuthExchangeDialogProps {
    onAuthUser: TOnAuthUser;
    onClose: () => void;
    open: boolean;
    user: string | null;
    changeCurrenciesInfo: IChangeCurrenciesInfo;
    id: string;
}
const AuthExchangeDialog: React.FC<IAuthExchangeDialogProps> = ({
    onAuthUser,
    onClose,
    open,
    user,
    changeCurrenciesInfo,
    id,
}) => (
    <Dialog open={open} onClose={onClose} renderToPortal>
        <AuthUser
            header="Geldwechsel"
            user={user}
            userBannerLabel="Identität bestätigen"
            onAuthUser={onAuthUser}
            cancelButton={{
                label: "Abbrechen",
                onClick: onClose,
            }}
            confirmButton={{
                label: "Wechseln",
                danger: true,
            }}
            actionSummary={<CheckoutSummary info={changeCurrenciesInfo} />}
            id={id}
        />
    </Dialog>
);

const RealToVirtual: React.FC = () => {
    const user = useContext(BankUserContext);
    const [dialogOpen, setDialogOpen] = useState(false);

    const changeCurrenciesInfo: IChangeCurrenciesInfo = {
        baseCurrency: "real",
        baseValue: 1,
        targetCurrency: "virtual",
        targetValue: 3.141,
    };

    return (
        <>
            <Card>
                <CardHeader>
                    {config.currencies.real.name} to{" "}
                    {config.currencies.virtual.name}
                </CardHeader>
                <CardContent>
                    <TextField
                        id="real-to-virtual__input"
                        type="number"
                        label={`von ${config.currencies.real.short}`}
                        defaultValue="1"
                    />
                    <DisplayInfo
                        label={`in ${config.currencies.virtual.short}`}
                        selected
                    >
                        3.141
                    </DisplayInfo>
                </CardContent>
                <CardActions fullBleed>
                    <CardActionButton
                        label="Wechsel buchen"
                        trailingIcon="swap_vert"
                        onClick={() => setDialogOpen(true)}
                    />
                </CardActions>
            </Card>
            <AuthExchangeDialog
                onAuthUser={() => setDialogOpen(false)}
                onClose={() => setDialogOpen(false)}
                open={dialogOpen}
                user={user}
                changeCurrenciesInfo={changeCurrenciesInfo}
                id="real-to-virtual"
            />
        </>
    );
};

const VirtualToReal: React.FC = () => {
    const user = useContext(BankUserContext);
    const [dialogOpen, setDialogOpen] = useState(false);

    const changeCurrenciesInfo: IChangeCurrenciesInfo = {
        baseCurrency: "virtual",
        baseValue: 1,
        targetCurrency: "real",
        targetValue: 0.32,
    };

    return (
        <>
            <Card>
                <CardHeader>
                    {config.currencies.virtual.name} to{" "}
                    {config.currencies.real.name}
                </CardHeader>
                <CardContent>
                    <TextField
                        id="virtual-to-real__input"
                        label={`von ${config.currencies.virtual.short}`}
                        defaultValue="0"
                    />
                    <DisplayInfo label={`in ${config.currencies.real.short}`}>
                        0
                    </DisplayInfo>
                </CardContent>
                <CardActions fullBleed>
                    <CardActionButton
                        label="Wechsel buchen"
                        trailingIcon="swap_vert"
                        onClick={() => setDialogOpen(true)}
                        disabled
                    />
                </CardActions>
            </Card>
            <AuthExchangeDialog
                onAuthUser={() => setDialogOpen(false)}
                onClose={() => setDialogOpen(false)}
                open={dialogOpen}
                user={user}
                changeCurrenciesInfo={changeCurrenciesInfo}
                id="virtual-to-real"
            />
        </>
    );
};

export const ChangeCurrencies: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <RealToVirtual />
        </GridCell>
        <GridCell span={4}>
            <VirtualToReal />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
