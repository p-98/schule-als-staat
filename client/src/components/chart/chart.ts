import {
    Chart as ChartJS,
    BarController,
    LineController,
    DoughnutController,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    TimeSeriesScale,
    Legend,
    Tooltip,
} from "chart.js";
import type { ChartType, TooltipItem } from "chart.js";
import tinycolor from "tinycolor2";

// local
import theme from "Utility/theme";

export * from "react-chartjs-2";

ChartJS.register(
    BarController,
    LineController,
    DoughnutController,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    CategoryScale,
    LinearScale,
    TimeSeriesScale,
    Legend,
    Tooltip
);

ChartJS.defaults.maintainAspectRatio = false;

ChartJS.defaults.datasets.bar.maxBarThickness = 32;
ChartJS.defaults.datasets.bar.borderWidth = 1;
ChartJS.defaults.datasets.bar.borderColor = theme.primary as string;

ChartJS.defaults.plugins.tooltip = {
    ...ChartJS.defaults.plugins.tooltip,
    // imitate mdc subtitle2 typography
    bodyFont: {
        family: "Roboto, sans-serif",
        size: 0.875 * 16,
        weight: "500",
        lineHeight: `${1.375 * 16}px`,
        style: "normal",
    },
    // imitate mdc caption typography
    titleFont: {
        family: "Roboto, sans-serif",
        size: 0.75 * 16,
        weight: "400",
        lineHeight: `${1.25 * 16}px`,
        style: "normal",
    },
    titleMarginBottom: 4,
    padding: 8,
    cornerRadius: 4,
    caretSize: 8,
    caretPadding: 8,
    position: "nearest",
    callbacks: {
        ...ChartJS.defaults.plugins.tooltip.callbacks,
    },

    // imitate card
    backgroundColor: theme.secondary as string,
    bodyColor: theme.onSecondary as string,
    titleColor: theme.onSecondary as string,
};

ChartJS.defaults.datasets.line = {
    ...ChartJS.defaults.datasets.line,
    cubicInterpolationMode: "monotone",
    borderJoinStyle: "round",
    borderCapStyle: "round",
    pointRadius: 3,
    pointBorderWidth: 0,
};

export const barScaleX = {
    grid: {
        drawTicks: false,
        drawOnChartArea: false,
        drawBorder: true,
    },
};

export const barScaleY = {
    min: 0,
    grid: {
        drawBorder: false,
    },
};

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const themeLine = (color: string) => ({
    borderColor: tinycolor(color).setAlpha(0.35).toHslString(),
    pointBackgroundColor: color,
    backgroundColor: color,
});

export const noTitles = (): string => "";

export const colonLabels = (item: TooltipItem<ChartType>): string =>
    `  ${item.label}: ${
        item.dataset.data[item.dataIndex]?.toString() as string
    }`;

export const bracketLabels = (item: TooltipItem<ChartType>): string =>
    `  ${item.label} (${
        item.dataset.data[item.dataIndex]?.toString() as string
    })`;
