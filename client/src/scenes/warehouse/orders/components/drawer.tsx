import {
    Drawer as RMWCDrawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
} from "Components/material/drawer";
import { TextField } from "Components/material/textfield";
import { Select } from "Components/material/select";
import { type ChangeEvent, type HTMLAttributes } from "react";
import { CardContent, CardInner } from "Components/material/card";

// local
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
                        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
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
                        onChange={(e: ChangeEvent<HTMLInputElement>) =>
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
