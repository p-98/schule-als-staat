import { useState } from "react";
import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { SimpleDataTable } from "Components/data-table/data-table";
import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { repeatArr } from "Utility/dataMockup";
import { DateControl } from "./components/dateControl";
import rawData, { dates, IWarehouseOrderFragment } from "../warehouse.data";
import { applyDateFilter } from "../util/filter";

import styles from "./orderSummary.module.scss";

/* eslint-disable no-param-reassign */
const parseTableData = (data: IWarehouseOrderFragment[]) =>
    Object.values(
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

export const OrderSummary: React.FC = () => {
    const [date, setDate] = useState(dates[0] as string);

    const filteredData = applyDateFilter(rawData, date);

    return (
        <div className={styles["order-summary"]}>
            <DrawerAppBarHandle title="Einkaufslisten" />
            <DateControl date={date} onChange={setDate} dates={dates} />
            <GridPage>
                <GridCell span={12}>
                    <SimpleDataTable
                        className={styles["order-summary__table"]}
                        stickyRows={1}
                        headers={[["Produkt ID", "Produktname", "Anzahl"]]}
                        data={repeatArr(parseTableData(filteredData), 10)}
                        fillPage
                    />
                </GridCell>
            </GridPage>
        </div>
    );
};
