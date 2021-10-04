import { DisplayInfo } from "Components/displayInfo/displayInfo";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

const userTypeIcons = {
    citizen: "person",
    guest: "person_outline",
    company: "domain",
};
export const UserInfo: React.FC = () => (
    <Card>
        <CardHeader>Benutzerinformationen</CardHeader>
        <CardContent>
            <DisplayInfo icon="group" label="Benutzerklasse">
                Bürger
            </DisplayInfo>
            <DisplayInfo icon={userTypeIcons.citizen} label="Benutzername">
                Max Mustermann
            </DisplayInfo>
        </CardContent>
    </Card>
);
