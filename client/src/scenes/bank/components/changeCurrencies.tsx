import { GridCell } from "Components/material/grid";
import { TextField } from "Components/material/textfield";
import { Dialog } from "Components/material/dialog";
import React, { useContext, useState } from "react";
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    CardActionButton,
} from "Components/material/card";
import { FragmentType } from "Utility/graphql";

// local
import {
    AuthUser,
    AuthUser_UserFragment,
    defaultMutation,
} from "Components/login/authUser";
import config from "Config";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { BankUserContext } from "../util/context";
import { CheckoutSummary } from "./checkoutSummary";
import type { IChangeCurrenciesInfo } from "../types";

interface IAuthExchangeDialogProps {
    onAuthUser: () => void;
    onClose: () => void;
    open: boolean;
    user: FragmentType<typeof AuthUser_UserFragment>;
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
            mutation={defaultMutation}
            title="Geldwechsel"
            user={user}
            userBanner={{ label: "Identität bestätigen" }}
            onSuccess={onAuthUser}
            cancelButton={{ label: "Abbrechen" }}
            onCancel={onClose}
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
