import { GridCell } from "Components/material/grid";

// local
import {
    UserInfo,
    BankAccountInfo,
    BankAccountInfo_UserFragment,
} from "Components/dashboard/dashboard";
import { makeFragmentData } from "Utility/graphql";

const user = makeFragmentData(
    {
        __typename: "CitizenUser" as const,
        balance: 10,
        redemptionBalance: 10,
    },
    BankAccountInfo_UserFragment
);
export const Dashboard: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <UserInfo />
        </GridCell>
        <GridCell>
            <BankAccountInfo user={user} />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
