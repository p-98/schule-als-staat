import "chartjs-adapter-date-fns";
import { format } from "date-fns";
import { useState } from "react";
import { Tick, Chart as ChartJS, ScatterDataPoint } from "chart.js";
import tinycolor from "tinycolor2";

// local
import { Card, CardChartContent, CardHeader } from "Components/card/card";
import { Dropdown } from "Components/dropdown/dropdown";
import { Line, themeLine } from "Components/chart/chart";
import theme from "Utility/theme";
import { ForceAspectRatio } from "Components/forceAspectRatio/forceAspectRatio";
import { cumulateFinancesData, genFinancesData } from "../finances.data";

import styles from "../finances.module.scss";

enum EDisplay {
    TotalDays = 0,
    TotalHours = 1,
}

const dates = genFinancesData()
    .reduce<string[]>((arr, fragment) => {
        const dateStr = fragment.date.toDateString();

        if (arr.includes(dateStr)) return arr;
        return [...arr, dateStr];
    }, [])
    .map((dateStr) => new Date(dateStr));

const options = [
    "Ges. Tage",
    "Ges. Std.",
    ...dates.map((date) => format(date, "dd.MM.")),
];

export const Chart: React.FC = () => {
    const [display, setDisplay] = useState(options.length - 1);

    let data = genFinancesData();
    if (display === EDisplay.TotalDays) data = cumulateFinancesData(data);
    if (display > 1) {
        const date = (dates[display - 2] as Date).toDateString();
        data = data.filter((fragment) => fragment.date.toDateString() === date);
    }

    const dataContainsNegative = !!data.find(
        (f) => f.profit < 0 || f.netRevenue < 0 || f.staff < 0
    );

    return (
        <Card>
            <CardHeader className={styles["chart__header"]}>
                Übersicht
                <Dropdown
                    rootProps={{ className: styles["chart__dropdown-root"] }}
                    options={options}
                    anchorCorner="topRight"
                    onSelect={(e) => setDisplay(e.detail.index)}
                >
                    {options[display]}
                </Dropdown>
            </CardHeader>
            <CardChartContent>
                <ForceAspectRatio ratio={16 / 9}>
                    <Line
                        data={{
                            datasets: [
                                {
                                    label: "Personalkosten",
                                    data: (data as unknown) as ScatterDataPoint[],
                                    parsing: {
                                        yAxisKey: "staff",
                                    },
                                    ...themeLine(theme.error as string),
                                    stepped: display !== EDisplay.TotalDays,
                                },
                                {
                                    label: "Nettoumsatz",
                                    data: (data as unknown) as ScatterDataPoint[],
                                    parsing: {
                                        yAxisKey: "netRevenue",
                                    },
                                    ...themeLine(theme.primary as string),
                                },
                                {
                                    label: "Gewinn",
                                    data: (data as unknown) as ScatterDataPoint[],
                                    parsing: {
                                        yAxisKey: "profit",
                                    },
                                    ...themeLine(theme.secondary as string),
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            parsing: {
                                xAxisKey: "date",
                            },
                            scales: {
                                y: {
                                    grid: {
                                        color({ tick }) {
                                            const color = tinycolor(
                                                ChartJS.defaults.scale.grid
                                                    .color as string
                                            );

                                            if (
                                                tick.value === 0 &&
                                                dataContainsNegative
                                            ) {
                                                return color
                                                    .setAlpha(
                                                        color.getAlpha() + 0.4
                                                    )
                                                    .toHslString();
                                            }

                                            return color.toHslString();
                                        },
                                    },
                                },
                                x: {
                                    type: "timeseries",
                                    time: {
                                        unit:
                                            display === EDisplay.TotalDays
                                                ? "day"
                                                : "hour",
                                        tooltipFormat:
                                            display === EDisplay.TotalDays
                                                ? "dd.MM."
                                                : "dd.MM. h 'Uhr'",
                                    },
                                    ticks: {
                                        source: "data",
                                        callback(_, index, ticks) {
                                            const date = new Date(
                                                (ticks[index] as Tick).value
                                            );
                                            const hourStr = format(
                                                date,
                                                "h 'Uhr'"
                                            );
                                            if (display === EDisplay.TotalDays)
                                                return format(date, "dd.MM.");
                                            if (
                                                display === EDisplay.TotalHours
                                            ) {
                                                return date.getHours() === 9
                                                    ? `${format(
                                                          date,
                                                          "dd.MM."
                                                      )} ${hourStr}`
                                                    : hourStr;
                                            }
                                            return hourStr;
                                        },
                                    },
                                },
                            },
                        }}
                    />
                </ForceAspectRatio>
            </CardChartContent>
        </Card>
    );
};
