// local
import { CitizenDialog } from "./citizenDialog";
import { CompanyDialog } from "./companyDialog";
import { GuestDialog } from "./guestDialog";

const getUserType = (user: string) => {
    switch (user) {
        case "Max Mustermann":
            return "citizen";
        case "Donuts Inc Ltd.":
            return "company";
        default:
            return "guest";
    }
};

interface ICrossingDialogProps {
    user?: string;
    onClosed: () => void;
}
export const CrossingDialog: React.FC<ICrossingDialogProps> = ({
    user,
    onClosed,
}) => {
    if (!user) return null;

    // eslint-disable-next-line default-case
    switch (getUserType(user)) {
        case "citizen":
            return <CitizenDialog user={user} onClosed={onClosed} />;
        case "company":
            return <CompanyDialog user={user} onClosed={onClosed} />;
        case "guest":
            return <GuestDialog user={user} onClosed={onClosed} />;
    }
};
