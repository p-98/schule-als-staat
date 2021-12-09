import { GridCell } from "@rmwc/grid";
import { TextField } from "@rmwc/textfield";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { SimpleDataTable } from "Components/data-table/data-table";
import { PageGrid } from "Components/pageGrid/pageGrid";
import data from "../warehouse.data";

const tableData = data.map(
    ({ id, dateFor, customer, product, quantity, collected }) => [
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
    ]
);

export const Orders: React.FC = () => (
    <PageGrid>
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
                    if (index === 5 && !isHead) props.hasFormControl = true;
                    return props;
                }}
                data={tableData}
                fillPage
            />
        </GridCell>
    </PageGrid>
);
