import { CardContent } from "Components/material/card";
import { SimpleDialog } from "Components/material/dialog";

// local
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import type { TWithCrossingDialogProps } from "../util/types";
import { useCustoms } from "../util/useCustoms";

export const CompanyDialog: React.FC<TWithCrossingDialogProps> = ({
    user,
    onClosed,
}) => {
    const [customsInput, chargeCustoms, customs] = useCustoms(user);

    return (
        <SimpleDialog
            open={!!user}
            onClosed={onClosed}
            onClose={chargeCustoms}
            accept={{ label: customs ? "Zollgebühren abbuchen" : "Schließen" }}
            title="Wareneinführung"
        >
            <CardContent>
                <DisplayInfo label="Unternehmen">{user}</DisplayInfo>
                {customsInput}
            </CardContent>
        </SimpleDialog>
    );
};
