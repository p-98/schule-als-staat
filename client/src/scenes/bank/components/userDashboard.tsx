import { GridCell } from "Components/material/grid";

// local
import {
    UserInfo,
    BankAccountInfo,
    BankAccountInfo_UserFragment,
} from "Components/dashboard/dashboard";
import { makeFragmentData } from "Utility/graphql";

const user = {
    __typename: "CitizenUser" as const,
    balance: 10,
    redemptionBalance: 10,
};
export const UserDashboard: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <UserInfo />
        </GridCell>
        <GridCell>
            <BankAccountInfo
                user={makeFragmentData(user, BankAccountInfo_UserFragment)}
            />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
