import { GridCell } from "@rmwc/grid";
import { Card } from "Components/card/card";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import PageGrid from "Components/pageGrid/pageGrid";
import Login from "Components/login/login";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

const LoginPage: React.FC = () => (
    <PageGrid>
        <GridCell desktop={4} tablet={2} phone={0} />
        <GridCell span={4}>
            <Card className={pageGridStyles["page-grid__cell-child"]}>
                <Login
                    onLogin={() => null}
                    cardHeader="Anmelden"
                    qrInfoText="Scanne den QR-Code auf dem Ausweis um dich anzumelden."
                    mode="login"
                    confirmButtonLabel="Anmelden"
                    userBannerLabel="Anmelden als"
                />
            </Card>
        </GridCell>
    </PageGrid>
);
export default LoginPage;
