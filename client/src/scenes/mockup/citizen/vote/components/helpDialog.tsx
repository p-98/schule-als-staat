import { CardContent } from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { IVote } from "Utility/types";

const explanationMap = {
    radio: (
        <CardContent text="Bei dieser Abstimmung muss man sich für eine der gegebenen Optionen entscheiden." />
    ),
    consensus: (
        <CardContent text="Bei dieser Abstimmung muss man jede der gegebeben Optionen jeweils auf einer Skala von 0 bis 5 bewerten." />
    ),
};

interface IHelpDialogProps {
    voteType: IVote["type"];
    open: boolean;
    onClose: () => void;
}
export const HelpDialog: React.FC<IHelpDialogProps> = ({
    voteType,
    open,
    onClose,
}) => (
    <SimpleDialog
        open={open}
        title="Erklärung der Abstimmung"
        cancel={{ label: "Schließen", onCancel: onClose }}
    >
        {explanationMap[voteType]}
    </SimpleDialog>
);
