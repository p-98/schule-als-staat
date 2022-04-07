import { useRef } from "react";
import { CardContent } from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { pickRandom } from "Utility/dataMockup";
import type { TWithCrossingDialogProps } from "../util/types";
import { useCustoms } from "../util/useCustoms";

const actions = ["Betritt den Staat", "Verlässt den Staat"];

export const CitizenDialog: React.FC<TWithCrossingDialogProps> = ({
    user,
    onClosed,
}) => {
    const action = useRef(pickRandom(actions));
    const [customsInput, chargeCustoms, customs] = useCustoms(user);

    return (
        <SimpleDialog
            open={!!user}
            onClosed={onClosed}
            accept={{
                label: customs ? "Zollgebühren abbuchen" : "OK",
                isDefaultAction: true,
                onAccept: chargeCustoms,
            }}
            title="Grenzübergang"
        >
            <CardContent>
                <DisplayInfo label="Vorgang">{action.current}</DisplayInfo>
                <DisplayInfo label="Person" activated>
                    {user}
                </DisplayInfo>
            </CardContent>
            {action.current === actions[0] && (
                <CardContent>{customsInput}</CardContent>
            )}
        </SimpleDialog>
    );
};
