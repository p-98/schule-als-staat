import { Card, CardHeader, CardContent } from "Components/material/card";

import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { currency } from "Utility/data";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

export const BankAccountInfo_UserFragment = graphql(/* GraohQL */ `
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
                    {currency(user.balance)}
                </DisplayInfo>
                <DisplayInfo icon="price_change" label="Rückwechselguthaben">
                    {`${user.redemptionBalance}`}
                </DisplayInfo>
            </CardContent>
        </Card>
    );
};
