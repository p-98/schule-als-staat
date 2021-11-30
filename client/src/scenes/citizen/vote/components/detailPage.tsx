import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { TWithVoteProp, checkPropertyType, isNumberArray } from "Utility/types";
import { GridScrollColumn } from "Components/gridScrollColumn/gridScrollCell";
import { VoteCard } from "./voteCard";
import { DescriptionCard } from "./descriptionCard";
import { ResultCharts } from "./resultCharts";

export const DetailPage: React.FC<TWithVoteProp> = ({ vote }) => (
    <PageGrid>
        <GridCell desktop={1} tablet={0} phone={0} />
        <GridCell span={5}>
            <GridScrollColumn desktop>
                <DescriptionCard vote={vote} />
                {checkPropertyType("result", vote, isNumberArray) && (
                    <ResultCharts vote={vote} />
                )}
            </GridScrollColumn>
        </GridCell>
        <GridCell desktop={0} tablet={0} phone={0} />
        <GridCell span={5}>
            <GridScrollColumn>
                <VoteCard vote={vote} />
            </GridScrollColumn>
        </GridCell>
    </PageGrid>
);
