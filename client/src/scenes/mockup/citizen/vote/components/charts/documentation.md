# Generation of result charts

The generation of a chart is triggered by the existance of a key in vote.chartInfo.

## Chart compoent

A chart Component must render its container (usually a Card and the ChartWrapper).

The props of the exported component must be of type `TWithVoteProp<IVoteWithChartInfo<IVoteWithResult, "chartName">>`.

## Registering chart

The component must be registered in the ChartMap in resultCharts.tsx with the same key that should trigger the chart generation.
