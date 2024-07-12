import { GridCell } from "Components/material/grid";
import { TextField } from "Components/material/textfield";
import { useState } from "react";
import { SimpleDataTable } from "Components/material/data-table";

// local
import { GridPage } from "Components/page/page";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { DrawerToggle } from "Components/drawerToggle/drawerToggle";
import rawData, { dates, IWarehouseOrderFragment } from "../warehouse.data";
import { applyDateFilter, applyCompanyFilter } from "../util/filter";
import { useFilter } from "./util/useFilter";
import { Drawer } from "./components/drawer";

const parseTableData = (data: IWarehouseOrderFragment[]) =>
    data.map(({ id, dateFor, customer, product, quantity, collected }) => [
        dateFor,
        customer.name,
        product.id,
        product.name,
        quantity,
        <TextField
            id={`orders-input-${id}`}
            defaultValue={collected}
            outlined
        />,
    ]);

export const Orders: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [filter, dispatchFilter] = useFilter();

    let filteredData = rawData;
    if (filter.date !== "NO_FILTER")
        filteredData = applyDateFilter(filteredData, filter.date);
    if (filter.company)
        filteredData = applyCompanyFilter(filteredData, filter.company);

    return (
        <DrawerToggle
            rightDrawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            drawer={
                <Drawer
                    filter={filter}
                    dispatchFilter={dispatchFilter}
                    dates={dates}
                />
            }
        >
            <GridPage>
                <DrawerAppBarHandle
                    title="Bestellungen"
                    actionItems={[
                        {
                            icon: "filter_list",
                            onClick: () => setDrawerOpen((open) => !open),
                        },
                    ]}
                />
                <GridCell span={12}>
                    <SimpleDataTable
                        stickyRows={1}
                        headers={[
                            [
                                "Bestellt für",
                                "Kunde",
                                "Produkt ID",
                                "Produktname",
                                "Bestellt",
                                "Abgeholt",
                            ],
                        ]}
                        getCellProps={(cell, index, isHead) => {
                            const props: Record<string, unknown> = {};
                            if (index === 5 && !isHead)
                                props.hasFormControl = true;
                            return props;
                        }}
                        data={parseTableData(filteredData)}
                        fillPage
                    />
                </GridCell>
            </GridPage>
        </DrawerToggle>
    );
};
