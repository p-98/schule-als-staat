import { GridCell } from "Components/material/grid";

// local
import { UserInfo, BankAccountInfo } from "Components/dashboard/dashboard";

export const Dashboard: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <UserInfo />
        </GridCell>
        <GridCell>
            <BankAccountInfo />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
