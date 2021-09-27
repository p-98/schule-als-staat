import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import UserInfo from "Components/dashboard/userInfo";
import AccountInfo from "Components/dashboard/accountInfo";

const Dashboard: React.FC = () => (
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
export default Dashboard;
