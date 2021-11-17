import { useState } from "react";
import { GridCell } from "@rmwc/grid";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// local
import { PageGrid } from "Components/pageGrid/pageGrid";
import { GetUser } from "Components/login/getUser";
import { Card } from "Components/card/card";
import { pickRandom } from "Utility/dataMockup";
import { CrossingDialog } from "./components/dialogs";

const users = ["Max Mustermann", "Donuts Inc Ltd.", "Fj3bK"];

export const BorderControl: React.FC = () => {
    const [user, setUser] = useState<string>();

    return (
        <PageGrid>
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell>
                <Card>
                    <GetUser
                        confirmButtonLabel="Bestätigen"
                        header="Grenzkontrolle"
                        qrInfoText="Scanne den QR-Code auf dem Ausweis, um einen Grenzübergang oder eine Wareneinführung zu registrieren."
                        onGetUser={() => !user && setUser(pickRandom(users))}
                    />
                </Card>
                <CrossingDialog
                    user={user}
                    onClosed={() => setUser(undefined)}
                />
            </GridCell>
        </PageGrid>
    );
};
