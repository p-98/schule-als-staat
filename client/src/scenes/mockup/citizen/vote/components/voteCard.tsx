import React, { useState } from "react";
import {
    Card,
    CardActionButton,
    CardActionButtons,
    CardActionIcon,
    CardActionIcons,
    CardActions,
    CardContent,
    CardHeader,
} from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { TWithVoteProp } from "Utility/types";
import { HelpDialog } from "./helpDialog";
import { voteTypeMap } from "./voteComponents";

interface ISubmitButtonProps {
    onSubmit: () => void;
}
const SubmitButton: React.FC<ISubmitButtonProps> = ({ onSubmit }) => {
    const [showConfirmation, setShowConfirmation] = useState(false);

    return (
        <>
            <CardActionButton onClick={() => setShowConfirmation(true)}>
                Stimme abgeben
            </CardActionButton>
            <SimpleDialog
                title="Stimme abgeben?"
                open={showConfirmation}
                cancel={{
                    label: "Abbrechen",
                    onCancel: () => setShowConfirmation(false),
                }}
                accept={{
                    label: "Bestätigen",
                    onAccept: () => {
                        onSubmit();
                        setShowConfirmation(false);
                    },
                    danger: true,
                }}
                renderToPortal
            >
                <CardContent text="Dies kann nicht rückgängig gemacht werden." />
            </SimpleDialog>
        </>
    );
};

const HelpIcon: React.FC<TWithVoteProp> = ({ vote }) => {
    const [showHelp, setShowHelp] = useState(false);

    return (
        <>
            <CardActionIcon onClick={() => setShowHelp(true)} icon="help" />
            <HelpDialog
                open={showHelp}
                voteType={vote.type}
                onClose={() => setShowHelp(false)}
            />
        </>
    );
};

export const VoteCard: React.FC<TWithVoteProp> = ({ vote }) => {
    const VoteComponent = voteTypeMap[vote.type];

    const voteEnded = vote.end < new Date();
    const voted = vote.vote !== undefined;

    return (
        <Card>
            <CardHeader key="header">Stimmabgabe</CardHeader>
            {voteEnded && vote.vote === undefined && (
                <CardContent
                    text="Keine Stimme abgegeben!"
                    key="no-vote-info"
                />
            )}
            <CardContent key="vote">
                {
                    // @ts-expect-error ts is not able to understand, that this chooses the correct component for each vote type
                    <VoteComponent vote={vote} disabled={voteEnded || voted} />
                }
            </CardContent>
            {!voteEnded && (
                <CardActions key="action">
                    <CardActionButtons>
                        <SubmitButton onSubmit={() => null} />
                    </CardActionButtons>
                    <CardActionIcons>
                        <HelpIcon vote={vote} />
                    </CardActionIcons>
                </CardActions>
            )}
        </Card>
    );
};
