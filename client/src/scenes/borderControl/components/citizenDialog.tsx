import { useRef } from "react";
import { ListDivider } from "@rmwc/list";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { SimpleDialog } from "Components/dialog/dialog";
import { CardContent } from "Components/card/card";
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
    const [customsInput, chargeCustoms] = useCustoms(user);

    return (
        <SimpleDialog
            open={!!user}
            onClosed={onClosed}
            accept={{ label: "OK", isDefaultAction: true }}
            onClose={chargeCustoms}
            title="Grenzübergang"
        >
            <CardContent>
                <DisplayInfo label="Vorgang">{action.current}</DisplayInfo>
                <DisplayInfo label="Person" activated>
                    {user}
                </DisplayInfo>
            </CardContent>
            <ListDivider />
            <CardContent>{customsInput}</CardContent>
        </SimpleDialog>
    );
};
