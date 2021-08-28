import { GridCell } from "@rmwc/grid";
import { TextField } from "@rmwc/textfield";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

const UserInfo: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
        <CardHeader>Benutzerinformationen</CardHeader>
        <CardContent>
            <TextField disabled label="Benutzerklasse" value="Bürger" />
            <TextField disabled label="Benutzername" value="Max Mustermann" />
        </CardContent>
    </Card>
);

const AccountInfo: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
        <CardHeader>Kontoinformationen</CardHeader>
        <CardContent>
            <TextField disabled label="Kontostand" value="219$" />
            <TextField
                disabled
                label="Rückwechselguthaben"
                value="10€ (100$)"
            />
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
