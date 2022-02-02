import { Chart } from "react-chartjs-2";
import type { ChartType, TooltipItem } from "chart.js";

// local
import theme from "Utility/theme";

export * from "react-chartjs-2";

Chart.defaults.maintainAspectRatio = false;

Chart.defaults.datasets.bar.maxBarThickness = 32;
Chart.defaults.datasets.bar.borderWidth = 1;
Chart.defaults.datasets.bar.borderColor = theme.primary as string;

Chart.defaults.plugins.tooltip = {
    ...Chart.defaults.plugins.tooltip,
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
        ...Chart.defaults.plugins.tooltip.callbacks,
    },

    // imitate card
    backgroundColor: theme.secondary as string,
    bodyColor: theme.onSecondary as string,
    titleColor: theme.onSecondary as string,
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

export const noTitles = (): string => "";

export const colonLabels = (item: TooltipItem<ChartType>): string =>
    `  ${item.label}: ${
        item.dataset.data[item.dataIndex]?.toString() as string
    }`;

export const bracketLabels = (item: TooltipItem<ChartType>): string =>
    `  ${item.label} (${
        item.dataset.data[item.dataIndex]?.toString() as string
    })`;
