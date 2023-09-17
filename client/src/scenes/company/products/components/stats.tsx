import { HTMLAttributes, useState } from "react";
import "chartjs-adapter-date-fns";
import { IconButton } from "Components/material/icon-button";
import type { ScatterDataPoint } from "chart.js";
import {
    CardChartContent,
    CardHeader,
    CardInner,
} from "Components/material/card";

// local
import { Line, themeLine } from "Components/chart/chart";
import theme from "Utility/theme";
import { Dropdown } from "Components/dropdown/dropdown";

import styles from "../products.module.css";

const dates = ["Gesamt", "13. Jun", "14. Jun"];

// data generation
const dateScale = [
    new Date("2021-06-13"),
    new Date("2021-06-14"),
    new Date("2021-06-17"),
];
const timeScale = Array(7)
    .fill(0)
    .map((_, index) => {
        const date = new Date("2021-06-13");
        date.setHours(index + 9);
        date.setMinutes(30);
        return date;
    });
const genData = <T,>(xArr: T[], max = 1) =>
    xArr.map((x) => ({
        x,
        y: Math.round((Math.random() * max) / 2) + max / 2,
    }));

interface IStatsProps extends HTMLAttributes<HTMLDivElement> {
    onGoBack: () => void;
}
export const Stats: React.FC<IStatsProps> = ({ onGoBack, ...restProps }) => {
    const [date, setDate] = useState(0);

    const total = date === 0;
    const scale = total ? dateScale : timeScale;
    const sales = genData(scale, total ? 50 : 10);
    const grossRevenue = sales.map((obj) => ({ ...obj, y: obj.y * 50 }));
    const netRevenue = grossRevenue.map((obj) => ({ ...obj, y: obj.y * 0.7 }));

    return (
        <CardInner
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
        >
            <CardHeader className={styles["product__stats-card-header"]}>
                <IconButton
                    icon="arrow_back"
                    label="Zurück"
                    onClick={onGoBack}
                    className={styles["product__back-icon"]}
                />
                <span className={styles["product__header-text"]}>
                    Statistiken
                </span>
                <Dropdown
                    onSelect={(e) => setDate(e.detail.index)}
                    options={dates}
                    rootProps={{ className: styles["stats__dropdown-root"] }}
                    anchorCorner="topRight"
                    renderToPortal
                >
                    {dates[date]}
                </Dropdown>
            </CardHeader>
            <CardChartContent className={styles["product__chart-card-content"]}>
                <Line
                    data={{
                        datasets: [
                            {
                                type: "bar",
                                label: "Verkäufe",
                                yAxisID: "yQuantity",
                                data: sales as unknown as ScatterDataPoint[],
                                hidden: true,
                            },
                            {
                                label: "Bruttoumsatz",
                                data: grossRevenue as unknown as ScatterDataPoint[],
                                yAxisID: "yMoney",
                                ...themeLine(theme.primary as string),
                            },
                            {
                                label: "Nettoumsatz",
                                data: netRevenue as unknown as ScatterDataPoint[],
                                yAxisID: "yMoney",
                                ...themeLine(theme.secondary as string),
                            },
                        ],
                    }}
                    options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            yMoney: {
                                type: "linear",
                                display: true,
                                position: "left",
                            },
                            yQuantity: {
                                type: "linear",
                                display: true,
                                position: "right",
                                min: 0,
                                grid: {
                                    drawOnChartArea: false,
                                },
                            },
                            x: {
                                type: "timeseries",
                                time: {
                                    unit: total ? "day" : "hour",
                                    displayFormats: {
                                        day: "dd.MM.",
                                        hour: "H",
                                    },
                                    tooltipFormat: total ? "dd.MM." : "H 'Uhr'",
                                },
                                ticks: {
                                    source: "data",
                                },
                            },
                        },
                    }}
                />
            </CardChartContent>
        </CardInner>
    );
};
