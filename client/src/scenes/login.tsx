import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import PageGrid from "Components/pageGrid/pageGrid";
import Login from "Components/login/login";

const LoginPage: React.FC = () => (
    <PageGrid>
        <GridCell desktop={4} tablet={2} phone={0} />
        <GridCell span={4}>
            <Login
                onLogin={() => null}
                cardHeader="Anmelden"
                qrInfoText="Scanne den QR-Code auf dem Ausweis um dich anzumelden."
                mode="login"
                confirmButtonLabel="Anmelden"
                userBannerLabel="Anmelden als"
            />
        </GridCell>
    </PageGrid>
);
export default LoginPage;
