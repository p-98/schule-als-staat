import { GridCell } from "@rmwc/grid";
import { Card } from "Components/card/card";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { GridPage } from "Components/page/page";
import { Login as LoginComponent } from "Components/login/login";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";

export const Login: React.FC = () => (
    <GridPage>
        <DrawerAppBarHandle title="Login" />
        <GridCell desktop={4} tablet={2} phone={0} />
        <GridCell span={4}>
            <Card>
                <LoginComponent
                    onLogin={() => null}
                    header="Anmelden"
                    qrInfoText="Scanne den QR-Code auf dem Ausweis um dich anzumelden."
                    confirmButton={{ label: "Anmelden" }}
                    userBannerLabel="Anmelden als"
                />
            </Card>
        </GridCell>
    </GridPage>
);
