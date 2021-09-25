import { GridCell } from "@rmwc/grid";
import DisplayInfo from "Components/displayInfo/displayInfo";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

const userTypeIcons = {
    citizen: "person",
    guest: "person_outline",
    company: "domain",
};
const UserInfo: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
        <CardHeader>Benutzerinformationen</CardHeader>
        <CardContent>
            <DisplayInfo icon="group" label="Benutzerklasse">
                Bürger
            </DisplayInfo>
            <DisplayInfo icon={userTypeIcons.citizen} label="Benutzername">
                Max Mustermann
            </DisplayInfo>
        </CardContent>
    </Card>
);

const AccountInfo: React.FC = () => (
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

const UserDashboard: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <UserInfo />
        </GridCell>
        <GridCell>
            <AccountInfo />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
export default UserDashboard;
