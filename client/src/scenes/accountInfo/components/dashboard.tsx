import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { UserInfo, AccountInfo } from "Components/dashboard/dashboard";

export const Dashboard: React.FC = () => (
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
