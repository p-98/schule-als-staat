import React from "react";
import tinycolor from "tinycolor2";
import { Card, CardContent, CardHeader } from "Components/material/card";

// local
import {
    Bar,
    barScaleX,
    barScaleY,
    bracketLabels,
    noTitles,
} from "Components/chart/chart";
import theme from "Utility/theme";
import type { IVoteWithResult, TWithVoteProp } from "Utility/types";
import { ChartWrapper } from "./chartWrapper";

const RadioChart: React.FC<TWithVoteProp<IVoteWithResult>> = ({ vote }) => (
    <ChartWrapper>
        <Bar
            data={{
                labels: vote.items,
                datasets: [{ data: vote.result }],
            }}
            options={{
                datasets: {
                    bar: {
                        backgroundColor: ({ dataset, dataIndex }) => {
                            // data is in range [0; 1]
                            const data = dataset.data[dataIndex] as number;

                            return tinycolor(theme.primary)
                                .setAlpha(data)
                                .toHslString();
                        },
                        hoverBackgroundColor: theme.primary,
                    },
                },
                scales: {
                    x: barScaleX,
                    y: {
                        ...barScaleY,
                        suggestedMax: 0.5,
                        ticks: { maxTicksLimit: 5 },
                    },
                },
                plugins: {
                    legend: {
                        display: false,
                    },
                    tooltip: {
                        callbacks: {
                            title: noTitles,
                            label: (item) => bracketLabels(item).trim(),
                        },
                        displayColors: false,
                    },
                },
            }}
        />
    </ChartWrapper>
);

const ChartCard = React.memo<TWithVoteProp<IVoteWithResult>>(({ vote }) => (
    <Card>
        <CardHeader>Ergebnis</CardHeader>
        <CardContent>
            <RadioChart vote={vote} />
        </CardContent>
    </Card>
));

export { ChartCard as RadioChart };
