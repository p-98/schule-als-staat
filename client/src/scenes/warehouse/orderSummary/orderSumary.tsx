import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { SimpleDataTable } from "Components/data-table/data-table";
import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import data from "../warehouse.data";

/* eslint-disable no-param-reassign */
const tableData = Object.values(
    data.reduce<Record<string, [string, string, number]>>(
        (obj, { product: { id, name }, quantity }) => {
            if (!(id in obj)) obj[id] = [id, name, 0];

            (obj[id] as [string, string, number])[2] += quantity;
            return obj;
        },
        {}
    )
);
/* eslint-enable no-param-reassign */

export const OrderSummary: React.FC = () => (
    <GridPage>
        <DrawerAppBarHandle title="Einkaufslisten" />
        <GridCell span={12}>
            <SimpleDataTable
                stickyRows={1}
                headers={[["Produkt ID", "Produktname", "Anzahl"]]}
                data={tableData}
                fillPage
            />
        </GridCell>
    </GridPage>
);
