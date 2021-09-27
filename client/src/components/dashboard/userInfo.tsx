import DisplayInfo from "Components/displayInfo/displayInfo";

// local
import { Card, CardHeader, CardContent } from "Components/card/card";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

const userTypeIcons = {
    citizen: "person",
    guest: "person_outline",
    company: "domain",
};
const UserInfo: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
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
export default UserInfo;
