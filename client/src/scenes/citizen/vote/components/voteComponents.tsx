import React, { useState } from "react";
import { Radio } from "Components/material/radio";
import { Typography } from "Components/material/typography";
import { Slider } from "Components/material/slider";

// local
import { IVoteRadio, IVoteConsensus, TWithVoteProp } from "Utility/types";

import styles from "../vote.module.css";

type IVoteRadioProps = {
    disabled: boolean;
};
const VoteRadio = React.memo<TWithVoteProp<IVoteRadio, IVoteRadioProps>>(
    ({ vote: voteProp, disabled }) => {
        const [vote, setVote] = useState(voteProp.vote ?? null);

        return (
            <>
                {voteProp.items.map((item, index) => (
                    <Radio
                        name={`voteForm${voteProp.id}`}
                        key={item}
                        id={item}
                        label={
                            <Typography
                                use="subtitle2"
                                theme="textPrimaryOnBackground"
                            >
                                {item}
                            </Typography>
                        }
                        checked={vote === index}
                        onChange={() => setVote(index)}
                        disabled={disabled}
                    />
                ))}
            </>
        );
    }
);

type IVoteConsensusProps = {
    disabled: boolean;
};
const VoteConsensus = React.memo<
    TWithVoteProp<IVoteConsensus, IVoteConsensusProps>
>(({ vote: voteProp, disabled }) => {
    const [vote, setVote] = useState<number[]>(
        voteProp.vote ?? Array(voteProp.items.length).fill(0)
    );

    return (
        <>
            {voteProp.items.map((item, index) => (
                <React.Fragment key={item}>
                    <Typography
                        use="subtitle2"
                        theme="textPrimaryOnBackground"
                        className={styles["vote__slider-caption"]}
                    >
                        {item}
                    </Typography>
                    <Slider
                        value={vote[index]}
                        min={0}
                        max={5}
                        discrete
                        displayMarkers
                        step={1}
                        onInput={(e) => {
                            const newVote = [...vote];
                            newVote[index] = e.detail.value;
                            setVote(newVote);
                        }}
                        disabled={disabled}
                    />
                </React.Fragment>
            ))}
        </>
    );
});

export const voteTypeMap = {
    radio: VoteRadio,
    consensus: VoteConsensus,
};
