import { GridCell } from "Components/material/grid";
import { Card } from "Components/material/card";

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
                    onSuccess={() => console.log("logged in!")}
                    title="Anmelden"
                    confirmButton={{ label: "Anmelden" }}
                    userBanner={{ label: "Anmelden als" }}
                />
            </Card>
        </GridCell>
    </GridPage>
);
