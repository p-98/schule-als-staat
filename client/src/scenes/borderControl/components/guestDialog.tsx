import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { SimpleDialog } from "Components/dialog/dialog";
import { CardContent } from "Components/card/card";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { pickRandom } from "Utility/dataMockup";
import { parseCurrency } from "Utility/parseCurrency";
import config from "Config";
import type { TWithCrossingDialogProps } from "../util/types";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const hasIdentity = (guest: string) => pickRandom([true, false]);

const CreateIdentityDialog: React.FC<TWithCrossingDialogProps> = ({
    user,
    onClosed,
}) => (
    <SimpleDialog
        open={!!user}
        onClosed={onClosed}
        accept={{ label: "Erstellen" }}
        cancel={{ label: "Abbrechen" }}
        title="Identität erstellen?"
    >
        <CardContent>
            <TextField id="create-identity-name" label="Name" type="text" />
            <TextField
                id="create-identity-balance"
                label={`Anfangskontostand in ${config.currencies.virtual.short}`}
                type="number"
                value="15.705"
                onChange={() => {}}
            />
        </CardContent>
    </SimpleDialog>
);

const RemoveIdentityDialog: React.FC<TWithCrossingDialogProps> = ({
    user,
    onClosed,
}) => (
    <SimpleDialog
        open={!!user}
        onClosed={onClosed}
        accept={{ label: "Entfernen", danger: true }}
        cancel={{ label: "Abbrechen" }}
        title="Identität entfernen?"
    >
        <CardContent>
            <DisplayInfo label="Name">Maxi Musterfrau</DisplayInfo>
            <DisplayInfo label="Kontostand">{parseCurrency(4.349)}</DisplayInfo>
        </CardContent>
    </SimpleDialog>
);

export const GuestDialog: React.FC<TWithCrossingDialogProps> = ({
    user,
    onClosed,
}) =>
    hasIdentity(user) ? (
        <CreateIdentityDialog user={user} onClosed={onClosed} />
    ) : (
        <RemoveIdentityDialog user={user} onClosed={onClosed} />
    );
