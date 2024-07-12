import React from "react";

// local
import { IVoteWithResult, TWithVoteProp } from "Utility/types";
import { RadioChart } from "./charts/radioChart";
import { ConsensusChart } from "./charts/consensusChart";
import { ParliamentCompositionChart } from "./charts/parliamentCompositionChart";

const ChartMap = {
    radio: RadioChart,
    consensus: ConsensusChart,
    parliamentComposition: ParliamentCompositionChart,
};

/* eslint-disable no-param-reassign */
function ensureChartInfoExists(
    vote: IVoteWithResult
): asserts vote is IVoteWithResult & { chartInfo: Record<string, unknown> } {
    if (!("chartInfo" in vote)) vote.chartInfo = {};
}

function ensureDefaultChartExists(
    vote: IVoteWithResult
): asserts vote is IVoteWithResult & { chartInfo: Record<string, unknown> } {
    ensureChartInfoExists(vote);

    if (!(vote.type in vote.chartInfo)) vote.chartInfo[vote.type] = {};
}
/* eslint-enable no-param-reassign */

function ensureChartExists(
    chart: string
): asserts chart is keyof typeof ChartMap {
    if (!(chart in ChartMap))
        throw new Error(`Chart ${chart} does not exist in ChartMap`);
}

export const ResultCharts = React.memo<TWithVoteProp<IVoteWithResult>>(
    ({ vote }) => {
        ensureDefaultChartExists(vote);

        return (
            <>
                {Object.keys(vote.chartInfo).map((chart) => {
                    ensureChartExists(chart);

                    const Chart = ChartMap[chart];
                    return <Chart key={chart} vote={vote} />;
                })}
            </>
        );
    }
);
