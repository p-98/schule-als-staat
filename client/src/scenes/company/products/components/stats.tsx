import { HTMLAttributes, useState } from "react";
import "chartjs-adapter-date-fns";
import { IconButton } from "@rmwc/icon-button";
import tinycolor from "tinycolor2";
import cn from "classnames";
import type { ScatterDataPoint } from "chart.js";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// local
import { CardContent, CardHeader, CardInner } from "Components/card/card";
import { Line } from "Components/chart/chart";
import theme from "Utility/theme";
import { Dropdown } from "./dropdown";

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
    const revenue = sales.map((obj) => ({ ...obj, y: obj.y * 50 }));
    const profit = revenue.map((obj) => ({ ...obj, y: obj.y * 0.7 }));

    return (
        <CardInner
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            className={cn(restProps.className, styles["stats"])}
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
                    className={styles["stats__dropdown"]}
                    anchorCorner="topRight"
                    renderToPortal
                >
                    {dates[date]}
                </Dropdown>
            </CardHeader>
            <CardContent className={styles["stats__content"]}>
                <div className={styles["stats__chart-wrapper"]}>
                    <Line
                        data={{
                            datasets: [
                                {
                                    type: "bar",
                                    label: "Verkäufe",
                                    yAxisID: "yQuantity",
                                    data: (sales as unknown) as ScatterDataPoint[],
                                    hidden: true,
                                },
                                {
                                    label: "Umsatz",
                                    data: (revenue as unknown) as ScatterDataPoint[],
                                    yAxisID: "yMoney",
                                    borderColor: tinycolor(theme.primary)
                                        .setAlpha(0.25)
                                        .toHslString(),
                                    pointBackgroundColor: theme.primary,
                                    backgroundColor: theme.primary,
                                },
                                {
                                    label: "Gewinn",
                                    data: (profit as unknown) as ScatterDataPoint[],
                                    yAxisID: "yMoney",
                                    borderColor: tinycolor(theme.secondary)
                                        .setAlpha(0.35)
                                        .toHslString(),
                                    pointBackgroundColor: theme.secondary,
                                    backgroundColor: theme.secondary,
                                },
                            ],
                        }}
                        options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            // stacked: false,
                            datasets: {
                                line: {
                                    cubicInterpolationMode: "monotone",
                                    borderJoinStyle: "round",
                                    borderCapStyle: "round",
                                    pointRadius: 3,
                                    pointBorderWidth: 0,
                                },
                            },
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
                                        tooltipFormat: total
                                            ? "dd.MM."
                                            : "H 'Uhr'",
                                    },
                                    ticks: {
                                        source: "data",
                                    },
                                },
                            },
                        }}
                    />
                </div>
            </CardContent>
        </CardInner>
    );
};
