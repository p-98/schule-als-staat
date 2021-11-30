import { Typography } from "@rmwc/typography";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import {
    Card,
    CardContent,
    CardHeader,
    CardMedia,
    CardMediaContent,
} from "Components/card/card";
import { TWithVoteProp } from "Utility/types";

import styles from "../vote.module.css";

export const DescriptionCard: React.FC<TWithVoteProp> = ({ vote }) => (
    <Card>
        <CardMedia sixteenByNine style={{ backgroundImage: "url(/vote.jpg)" }}>
            <CardMediaContent>
                <Typography
                    use="headline5"
                    theme="textPrimaryOnDark"
                    className={styles["vote__description-header"]}
                >
                    {vote.title}
                </Typography>
            </CardMediaContent>
        </CardMedia>
        <CardHeader>Beschreibung</CardHeader>
        <CardContent>
            <Typography use="body1" theme="textSecondaryOnBackground">
                {vote.description}
            </Typography>
        </CardContent>
    </Card>
);
