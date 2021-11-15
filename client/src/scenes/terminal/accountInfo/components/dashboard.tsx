import { GridCell } from "@rmwc/grid";
import React from "react";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { UserInfo, BankAccountInfo } from "Components/dashboard/dashboard";

export const Dashboard: React.FC = () => pug`
  React.Fragment
    GridCell(desktop=2 tablet=0 phone=0)
    GridCell(span=4)
      UserInfo

    GridCell
      BankAccountInfo

    GridCell(desktop=2 tablet=0 phone=0)
`;
