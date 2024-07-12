import React from "react";
import tinycolor from "tinycolor2";
import { Card, CardContent, CardHeader } from "Components/material/card";

// local
import theme from "Utility/theme";
import {
    Bar,
    barScaleX,
    barScaleY,
    bracketLabels,
    noTitles,
} from "Components/chart/chart";
import {
    IVoteWithChartInfo,
    IVoteWithResult,
    TWithVoteProp,
    isObject,
    inOperator,
    checkPropertyType,
    isStringArray,
} from "Utility/types";
import { ChartWrapper } from "./chartWrapper";

// define types
const ChartName = "consensus";
interface IConsensusChartInfo {
    colors?: string[];
}
type VoteUnchecked = IVoteWithChartInfo<IVoteWithResult, typeof ChartName>;
type VoteChecked = IVoteWithChartInfo<
    IVoteWithResult,
    typeof ChartName,
    IConsensusChartInfo
>;

// assertion function
function checkChartInfo(vote: VoteUnchecked): VoteChecked {
    const chartInfo = vote.chartInfo[ChartName];

    if (!isObject(chartInfo))
        throw new TypeError(`chartInfo.${ChartName} is not of type object`);

    if (
        inOperator("colors", chartInfo) && // undefined is allowed
        !checkPropertyType("colors", chartInfo, isStringArray)
    ) {
        throw new TypeError(
            `chartInfo.${ChartName}.colors is not of type undefined | string[]`
        );
    }

    return { ...vote, chartInfo: { [ChartName]: chartInfo } };
}

const ConsensusChart: React.FC<TWithVoteProp<VoteChecked>> = ({ vote }) => {
    const chartInfo = vote.chartInfo.consensus;
    const colors =
        chartInfo.colors ??
        Array<string>(vote.items.length).fill(theme.primary as string);

    return (
        <ChartWrapper>
            <Bar
                data={{
                    labels: vote.items,
                    datasets: [{ data: vote.result }],
                }}
                options={{
                    datasets: {
                        bar: {
                            borderColor: colors,
                            backgroundColor: colors.map((color, index) => {
                                const alpha = vote.chartInfo.colors
                                    ? (vote.result[index] as number) / 5
                                    : 0.5;
                                return tinycolor(color)
                                    .setAlpha(alpha)
                                    .toHslString();
                            }),
                            hoverBackgroundColor: colors,
                        },
                    },
                    scales: {
                        x: barScaleX,
                        y: {
                            ...barScaleY,
                            max: 5,
                            ticks: { count: 6 },
                        },
                    },
                    plugins: {
                        legend: {
                            display: false,
                        },
                        tooltip: {
                            callbacks: {
                                title: noTitles,
                                label: bracketLabels,
                            },
                        },
                    },
                }}
            />
        </ChartWrapper>
    );
};

const CheckChartInfo = React.memo<TWithVoteProp<VoteUnchecked>>(({ vote }) => {
    const checkedVote = checkChartInfo(vote);
    return (
        <Card>
            <CardHeader>Ergebnis</CardHeader>
            <CardContent>
                <ConsensusChart vote={checkedVote} />
            </CardContent>
        </Card>
    );
});
export { CheckChartInfo as ConsensusChart };
