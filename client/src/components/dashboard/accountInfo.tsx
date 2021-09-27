import { DisplayInfo } from "Components/displayInfo/displayInfo";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

export const AccountInfo: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
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
