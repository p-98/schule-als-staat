import { useCallback, useEffect, useState } from "react";
import { GridCell } from "@rmwc/grid";
import { ListDivider } from "@rmwc/list";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { Card, CardHeader, CardListContent } from "Components/card/card";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { GridPage } from "Components/page/page";
import { VoteListItem } from "./components/voteListeItem";
import votes from "./votes.data";

const useForceRerender = () => {
    const [, setCounter] = useState(0);

    return useCallback(() => {
        setCounter((_counter) => _counter + 1);
    }, [setCounter]);
};

export const Vote: React.FC = () => {
    const forceRerender = useForceRerender();
    const now = new Date();

    // initially schedule rerenders when the votes end to display them in the correct section
    useEffect(() => {
        votes.forEach((vote) => {
            const timeDiff = vote.end.getTime() - now.getTime();

            if (timeDiff >= 0) setTimeout(() => forceRerender(), timeDiff);
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [votes, forceRerender]);

    return (
        <GridPage>
            <DrawerAppBarHandle title="Abstimmungen" />
            <GridCell desktop={3} tablet={1} phone={0} />
            <GridCell span={6} phone={4}>
                <Card>
                    <CardHeader>Abstimmungen</CardHeader>
                    <CardListContent caption="Noch nicht abgestimmt">
                        {votes
                            .filter(
                                (vote) =>
                                    vote.end > now && vote.vote === undefined
                            )
                            .map((vote) => (
                                <VoteListItem vote={vote} key={vote.id} />
                            ))}
                    </CardListContent>
                    <ListDivider />
                    <CardListContent caption="Bereits abgestimmt">
                        {votes
                            .filter(
                                (vote) =>
                                    vote.end > now && vote.vote !== undefined
                            )
                            .map((vote) => (
                                <VoteListItem vote={vote} key={vote.id} />
                            ))}
                    </CardListContent>
                    <ListDivider />
                    <CardListContent caption="Beendet">
                        {votes
                            .filter((vote) => vote.end <= now)
                            .map((vote) => (
                                <VoteListItem vote={vote} key={vote.id} />
                            ))}
                    </CardListContent>
                </Card>
            </GridCell>
        </GridPage>
    );
};
