import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { Card, CardHeader, CardContent } from "Components/material/card";
import config from "Config";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

const BankAccountInfo_UserFragment = graphql(/* GraohQL */ `
    fragment BankAccountInfo_UserFragment on User {
        balance
        redemptionBalance
    }
`);

interface IBankAccountInfoProps {
    user: FragmentType<typeof BankAccountInfo_UserFragment>;
}
export const BankAccountInfo: React.FC<IBankAccountInfoProps> = ({
    user: _user,
}) => {
    const user = useFragment(BankAccountInfo_UserFragment, _user);
    return (
        <Card>
            <CardHeader>Kontoinformationen</CardHeader>
            <CardContent>
                <DisplayInfo icon="account_balance" label="Kontostand">
                    {`${user.balance}${config.currencies.virtual.symbol}`}
                </DisplayInfo>
                <DisplayInfo icon="price_change" label="Rückwechselguthaben">
                    {`${user.redemptionBalance}${config.currencies.real.symbol}`}
                </DisplayInfo>
            </CardContent>
        </Card>
    );
};
