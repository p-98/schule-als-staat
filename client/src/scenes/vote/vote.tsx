import { useCallback, useEffect, useState } from "react";
import { GridCell } from "@rmwc/grid";
import { PageGrid } from "Components/pageGrid/pageGrid";
import { Typography } from "@rmwc/typography";
import { List, ListDivider } from "@rmwc/list";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { Card, CardContent, CardHeader } from "Components/card/card";
import { VoteListItem } from "./components/voteListeItem";
import votes from "./votes.data";

import styles from "./vote.module.css";

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
        <PageGrid>
            <GridCell desktop={3} tablet={1} phone={0} />
            <GridCell span={6} phone={4}>
                <Card>
                    <CardHeader>Abstimmungen</CardHeader>
                    <CardContent>
                        <Typography
                            use="caption"
                            theme="textPrimaryOnBackground"
                            className={styles["vote__list-caption"]}
                        >
                            Noch nicht abgestimmt
                        </Typography>
                        <List className={styles["vote__list"]}>
                            {votes
                                .filter(
                                    (vote) =>
                                        vote.end > now &&
                                        vote.vote === undefined
                                )
                                .map((vote) => (
                                    <VoteListItem vote={vote} key={vote.id} />
                                ))}
                        </List>
                    </CardContent>
                    <ListDivider />
                    <CardContent>
                        <Typography
                            use="caption"
                            theme="textPrimaryOnBackground"
                            className={styles["vote__list-caption"]}
                        >
                            Bereits abgestimmt
                        </Typography>
                        <List className={styles["vote__list"]}>
                            {votes
                                .filter(
                                    (vote) =>
                                        vote.end > now &&
                                        vote.vote !== undefined
                                )
                                .map((vote) => (
                                    <VoteListItem vote={vote} key={vote.id} />
                                ))}
                        </List>
                    </CardContent>
                    <ListDivider />
                    <CardContent>
                        <Typography
                            use="caption"
                            theme="textPrimaryOnBackground"
                            className={styles["vote__list-caption"]}
                        >
                            Beendet
                        </Typography>
                        <List className={styles["vote__list"]}>
                            {votes
                                .filter((vote) => vote.end <= now)
                                .map((vote) => (
                                    <VoteListItem vote={vote} key={vote.id} />
                                ))}
                        </List>
                    </CardContent>
                </Card>
            </GridCell>
        </PageGrid>
    );
};
