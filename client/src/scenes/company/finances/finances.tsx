import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { useCompanyAdminRedirect } from "Utility/hooks/useRedirect";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import { TopRevenue, TopSales } from "./components/topProducts";
import { Chart } from "./components/chart";
import { BonusPayout } from "./components/bonusPayout";

import styles from "./finances.module.scss";

export const Finances: React.FC = () => {
    useCompanyAdminRedirect();

    const TopSalesElement = <TopSales />;
    const TopRevenueElement = <TopRevenue />;

    return (
        <GridPage>
            <DrawerAppBarHandle title="Finanzen" />
            <GridCell desktop={0} span={4}>
                {TopSalesElement}
            </GridCell>
            <GridCell desktop={0} span={4}>
                {TopRevenueElement}
            </GridCell>
            <GridCell
                span={4}
                tablet={8}
                className={styles["finances__scroll-cell"]}
            >
                <GridScrollColumn desktop>
                    <GridCell tablet={0} phone={0}>
                        {TopSalesElement}
                    </GridCell>
                    <GridCell tablet={0} phone={0}>
                        {TopRevenueElement}
                    </GridCell>
                    <GridCell span={4}>
                        <BonusPayout />
                    </GridCell>
                </GridScrollColumn>
            </GridCell>
            <GridCell span={8}>
                <Chart />
            </GridCell>
        </GridPage>
    );
};
