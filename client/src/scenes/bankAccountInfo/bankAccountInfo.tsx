import { useQuery } from "urql";
import { GridCell } from "Components/material/grid";
import { GridPage } from "Components/page/page";
import { BankAccountInfo as BasicBankAccountInfo } from "Components/dashboard/dashboard";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { graphql } from "Utility/graphql";
import { useCategorizeError, useSafeData, useStable } from "Utility/urql";
import { Transactions } from "./components/transactions";

const query = graphql(/* GraohQL */ `
    query BankAccountInfoQuery {
        me {
            ...BankAccountInfo_UserFragment
            ...Transactions_UserFragment
        }
    }
`);

export const BankAccountInfo: React.FC = () => {
    const [result] = useQuery({ query });
    const { data, fetching, error } = useSafeData(result);
    useCategorizeError(error, []);
    if (useStable(fetching)) return <div>Loading...</div>;
    if (!data) return <></>;

    return (
        <GridPage>
            <DrawerAppBarHandle title="Bankkonto" />
            <GridCell desktop={1} tablet={1} phone={0} />
            <GridCell span={4} tablet={6}>
                <GridScrollColumn desktop>
                    <BasicBankAccountInfo user={data.me} />
                </GridScrollColumn>
            </GridCell>
            <GridCell desktop={0} tablet={1} phone={0} />
            <GridCell desktop={0} tablet={1} phone={0} />
            <GridCell desktop={6} tablet={6} phone={4}>
                <GridScrollColumn desktop>
                    <Transactions user={data.me} />
                </GridScrollColumn>
            </GridCell>
        </GridPage>
    );
};
