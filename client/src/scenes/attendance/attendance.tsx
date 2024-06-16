import { useQuery } from "urql";
import { type ChangeEvent, type FC, memo, useState } from "react";
import { Select } from "Components/material/select";
import { Card, CardContent, CardHeader } from "Components/material/card/card";
import { List, ListDivider, SimpleListItem } from "Components/material/list";
import { GridCell } from "Components/material/grid";

import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { FallbackText } from "Components/fallbackText/fallbackText";
import { graphql } from "Utility/graphql";
import { useCategorizeError, useSafeData, useStable } from "Utility/urql";
import { bool, hours, name } from "Utility/data";
import config from "Config";

import css from "./attendance.module.css";

/* General purpose helpers
 */

/** Replace first and third space by non-breaking space */
const nonbreaking = (_: string) =>
    _.replace(/(?<=^[^ ]+( [^ ]+ [^ ]+)*) /g, " ");

/* Helper components
 */

interface SelectClassProps {
    value: undefined | string;
    onChange: (_: string) => void;
}
const SelectClass: FC<SelectClassProps> = ({ value, onChange }) => (
    <Select
        label="Klasse"
        options={config.school.classes}
        value={value}
        onChange={(e: ChangeEvent<HTMLSelectElement>) =>
            onChange(e.currentTarget.value)
        }
    />
);

const NothinSelected: FC = memo(() => (
    <FallbackText icon="search" text="Keine Klasse ausgewählt." />
));
const Error: FC = memo(() => (
    <FallbackText icon="error" text="Ein unerwarteter Fehler is aufgetreten." />
));
const Fetching: FC = memo(() => <FallbackText icon="refresh" text="Lädt..." />);

const query = graphql(/* GraphQL */ `
    query AttendanceQuery($class: String!) {
        citizensByClass(class: $class) {
            id
            ...Name_UserFragment
            isInState
            timeInState
        }
    }
`);
interface AttendanceByClassProps {
    class: undefined | string;
}
const AttendanceByClass: FC<AttendanceByClassProps> = ({ class: classs }) => {
    const [result] = useQuery({
        query,
        pause: !classs,
        variables: { class: classs! },
    });
    const { data, fetching, error } = useSafeData(result);
    const [unexpectedError] = useCategorizeError(error, []);
    if (useStable(fetching)) return <Fetching />;
    if (unexpectedError) return <Error />;
    if (data)
        return (
            <List twoLine>
                {data.citizensByClass.map((c) => (
                    <SimpleListItem
                        key={c.id}
                        className={css["attendance__citizen"]}
                        activated={c.isInState}
                        text={name(c)}
                        secondaryText={`Im Staat: ${bool(c.isInState)}`}
                        meta={nonbreaking(hours(c.timeInState))}
                    />
                ))}
            </List>
        );
    return <NothinSelected />;
};

/* Main component
 */

export const Attendance: FC = () => {
    const [classs, setClass] = useState<string>();
    return (
        <PageGrid>
            <DrawerAppBarHandle title="Anwesenheit" />
            <GridCell desktop={3} tablet={1} phone={0} />
            <GridCell span={6} phone={4}>
                <Card>
                    <CardHeader>Anwesenheit</CardHeader>
                    <CardContent>
                        <SelectClass value={classs} onChange={setClass} />
                    </CardContent>
                    <ListDivider />
                    <AttendanceByClass class={classs} />
                </Card>
            </GridCell>
        </PageGrid>
    );
};
