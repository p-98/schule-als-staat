import { GridCell } from "@rmwc/grid";
import { Card } from "Components/card/card";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { Login as LoginComponent } from "Components/login/login";

export const Login: React.FC = () => (
    <PageGrid>
        <GridCell desktop={4} tablet={2} phone={0} />
        <GridCell span={4}>
            <Card>
                <LoginComponent
                    onLogin={() => null}
                    header="Anmelden"
                    qrInfoText="Scanne den QR-Code auf dem Ausweis um dich anzumelden."
                    confirmButtonLabel="Anmelden"
                    userBannerLabel="Anmelden als"
                />
            </Card>
        </GridCell>
    </PageGrid>
);
