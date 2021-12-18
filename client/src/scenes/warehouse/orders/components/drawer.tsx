import {
    Drawer as RMWCDrawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "@rmwc/drawer";
import { TextField } from "@rmwc/textfield";
import { Select } from "@rmwc/select";
import { HTMLAttributes } from "react";

// drawer imports
import "@material/drawer/dist/mdc.drawer.css";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// select imports
import "@rmwc/select/select.css";
import "@material/select/dist/mdc.select.css";
// import '@material/floating-label/dist/mdc.floating-label.css';
// import '@material/notched-outline/dist/mdc.notched-outline.css';
// import '@material/line-ripple/dist/mdc.line-ripple.css';
import "@material/list/dist/mdc.list.css";
import "@material/menu/dist/mdc.menu.css";
import "@material/menu-surface/dist/mdc.menu-surface.css";
// import '@material/ripple/dist/mdc.ripple.css';

// local
import { CardContent, CardInner } from "Components/card/card";
import type { TFilter, TDispatchFilter } from "../util/useFilter";

interface IDrawerProps extends HTMLAttributes<HTMLElement> {
    filter: TFilter;
    dispatchFilter: TDispatchFilter;
    dates: string[];
}
export const Drawer: React.FC<IDrawerProps> = ({
    filter,
    dispatchFilter,
    dates,
    ...restProps
}) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RMWCDrawer {...restProps}>
        <DrawerHeader>
            <DrawerTitle>Filter</DrawerTitle>
        </DrawerHeader>
        <DrawerContent>
            <CardInner>
                <CardContent>
                    <Select
                        enhanced
                        label="Datum"
                        options={[
                            { label: "Alle", value: "NO_FILTER" },
                            ...dates.map((date) => ({
                                label: date,
                                value: date,
                            })),
                        ]}
                        value={filter.date}
                        onChange={(e) =>
                            dispatchFilter({
                                filter: "date",
                                value: e.currentTarget.value,
                            })
                        }
                    />
                    <TextField
                        label="Unternehmen"
                        type="text"
                        value={filter.company}
                        onChange={(e) =>
                            dispatchFilter({
                                filter: "company",
                                value: e.currentTarget.value,
                            })
                        }
                    />
                </CardContent>
            </CardInner>
        </DrawerContent>
    </RMWCDrawer>
);
