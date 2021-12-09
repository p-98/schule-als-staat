import {
    SimpleDataTable as RMWCSimpleDataTable,
    SimpleDataTableProps,
    DataTableProps,
} from "@rmwc/data-table";
import { ComponentProps } from "@rmwc/types";
import cn from "classnames";

// data-table imports
import "@material/data-table/dist/mdc.data-table.css";
import "@rmwc/data-table/data-table.css";
import "@rmwc/icon/icon.css";

// local
import styles from "./data-table.module.scss";

// rmwc reexports
export * from "@rmwc/data-table";

type TSimpleDataTableProps = ComponentProps<
    DataTableProps,
    React.HTMLProps<HTMLElement>,
    "div"
> &
    SimpleDataTableProps & {
        fillPage?: boolean;
    };
export const SimpleDataTable: React.FC<TSimpleDataTableProps> = ({
    fillPage,
    className,
    ...restProps
}) => (
    <RMWCSimpleDataTable
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        // @ts-expect-error wrong rmwc typing. SimpleDataTable forwards all props to DataTable
        className={cn(
            className,
            styles["data-table"],
            fillPage && styles["data-table--fill-page"]
        )}
    />
);
