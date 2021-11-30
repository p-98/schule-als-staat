import React from "react";
import tinycolor from "tinycolor2";

// local
import { colonLabels, Doughnut, noTitles } from "Components/chart/chart";
import {
    IVoteWithChartInfo,
    IVoteWithResult,
    isNumberArray,
    isStringArray,
    isObject,
    checkPropertyType,
    TWithVoteProp,
} from "Utility/types";
import { Card, CardContent, CardHeader } from "Components/card/card";
import { ChartWrapper } from "./chartWrapper";

// define types
const ChartName = "parliamentComposition";
interface IParliamentCompositionChartInfo {
    seats: number[];
    colors: string[];
}
type VoteUnchecked = IVoteWithChartInfo<IVoteWithResult, typeof ChartName>;
type VoteChecked = IVoteWithChartInfo<
    IVoteWithResult,
    typeof ChartName,
    IParliamentCompositionChartInfo
>;

// assertion function for vote
function checkChartInfo(vote: VoteUnchecked): VoteChecked {
    const chartInfo = vote.chartInfo[ChartName];

    if (!isObject(chartInfo))
        throw new TypeError(`chartInfo.${ChartName} is not of type object`);

    if (!checkPropertyType("seats", chartInfo, isNumberArray))
        throw new TypeError(
            `chartInfo.${ChartName}.seats is not of type number[]`
        );

    if (!checkPropertyType("colors", chartInfo, isStringArray))
        throw new TypeError(
            `chartInfo.${ChartName}.colors is not of type string[]`
        );

    return { ...vote, chartInfo: { [ChartName]: chartInfo } };
}

// chart component
const ParliamentCompositionChart: React.FC<TWithVoteProp<VoteChecked>> = ({
    vote,
}) => {
    const chartInfo = vote.chartInfo[ChartName];

    return (
        <ChartWrapper>
            <Doughnut
                data={{
                    labels: vote.items,
                    datasets: [{ data: vote.result }],
                }}
                options={{
                    datasets: {
                        doughnut: {
                            rotation: -90,
                            circumference: 180,
                            borderWidth: 1,
                            borderColor: chartInfo.colors,
                            backgroundColor: chartInfo.colors.map((color) =>
                                tinycolor(color).setAlpha(0.5).toHslString()
                            ),
                            hoverBackgroundColor: chartInfo.colors,
                            offset: 12,
                        },
                    },
                    plugins: {
                        legend: {
                            onClick: () => null,
                        },
                        tooltip: {
                            callbacks: { title: noTitles, label: colonLabels },
                        },
                    },
                }}
            />
        </ChartWrapper>
    );
};

const ChartCard = React.memo<TWithVoteProp<VoteUnchecked>>(({ vote }) => {
    const checkedVote = checkChartInfo(vote);
    return (
        <Card>
            <CardHeader>Sitzverteilung Parlament</CardHeader>
            <CardContent>
                <ParliamentCompositionChart vote={checkedVote} />
            </CardContent>
        </Card>
    );
});

export { ChartCard as ParliamentCompositionChart };
