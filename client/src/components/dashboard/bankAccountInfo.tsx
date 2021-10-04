import { DisplayInfo } from "Components/displayInfo/displayInfo";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

export const BankAccountInfo: React.FC = () => (
    <Card>
        <CardHeader>Kontoinformationen</CardHeader>
        <CardContent>
            <DisplayInfo icon="account_balance" label="Kontostand">
                219π
            </DisplayInfo>
            <DisplayInfo icon="price_change" label="Rückwechselguthaben">
                10€ (31.410π)
            </DisplayInfo>
        </CardContent>
    </Card>
);
