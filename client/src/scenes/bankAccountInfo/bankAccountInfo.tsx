import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { BankAccountInfo as BasicBankAccountInfo } from "Components/dashboard/dashboard";
import { Transactions } from "./components/transactions";

export const BankAccountInfo: React.FC = () => (
    <PageGrid>
        <GridCell desktop={1} tablet={1} phone={0} />
        <GridCell span={4} tablet={6}>
            <BasicBankAccountInfo />
        </GridCell>
        <GridCell desktop={0} tablet={1} phone={0} />
        <GridCell desktop={0} tablet={1} phone={0} />
        <GridCell desktop={6} tablet={6} phone={4}>
            <Transactions />
        </GridCell>
    </PageGrid>
);
