import React from "react";
import { GridCell } from "Components/material/grid";

// local
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import {
    HorizontalTabs,
    HorizontalTabsElement,
} from "Components/horizontalTabs/horizontalTabs";
import { GridPage } from "Components/page/page";
import { placeholderify } from "Utility/placeholderify";
import { EmployeeCard } from "./components/employee";
import { employees } from "./employees.data";
import { Offers } from "./components/offers";

import styles from "./employees.module.scss";

export const Employees: React.FC = () => {
    let placeholderIndex = -1;

    const employeeCards = employees.map((employee) => (
        <GridCell span={6} key={employee.id}>
            <EmployeeCard employee={employee} />
        </GridCell>
    ));

    const withTabletPlaceholders = placeholderify(employeeCards, 1, () => (
        <GridCell
            desktop={0}
            tablet={1}
            phone={0}
            key={`ph${(placeholderIndex += 1)}`}
        />
    ));

    return (
        <>
            <DrawerAppBarHandle title="Mitarbeiterverwaltung" />
            <HorizontalTabs>
                <HorizontalTabsElement title="Angestellt">
                    <GridPage className={styles["employees__page"]}>
                        {withTabletPlaceholders}
                    </GridPage>
                </HorizontalTabsElement>
                <HorizontalTabsElement title="Angebote">
                    <Offers />
                </HorizontalTabsElement>
            </HorizontalTabs>
        </>
    );
};
