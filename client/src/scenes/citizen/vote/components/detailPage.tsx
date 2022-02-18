import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { TWithVoteProp, checkPropertyType, isNumberArray } from "Utility/types";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import { VoteCard } from "./voteCard";
import { DescriptionCard } from "./descriptionCard";
import { ResultCharts } from "./resultCharts";

export const DetailPage: React.FC<TWithVoteProp> = ({ vote }) => (
    <>
        <GridCell desktop={1} tablet={0} phone={0} />
        <GridCell desktop={5} tablet={4}>
            <GridScrollColumn desktop>
                <DescriptionCard vote={vote} />
                {checkPropertyType("result", vote, isNumberArray) && (
                    <ResultCharts vote={vote} />
                )}
            </GridScrollColumn>
        </GridCell>
        <GridCell desktop={0} tablet={0} phone={0} />
        <GridCell desktop={5} tablet={4}>
            <GridScrollColumn desktop>
                <VoteCard vote={vote} />
            </GridScrollColumn>
        </GridCell>
    </>
);
