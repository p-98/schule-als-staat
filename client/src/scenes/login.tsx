import { useRouter } from "next/router";
import { GridCell } from "Components/material/grid";
import { Card } from "Components/material/card";

// local
import { GridPage } from "Components/page/page";
import { Login as LoginComponent } from "Components/login/login";
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { dispatch } from "Utility/misc";

export const Login: React.FC = () => {
    const router = useRouter();
    return (
        <GridPage>
            <DrawerAppBarHandle title="Login" />
            <GridCell desktop={4} tablet={2} phone={0} />
            <GridCell span={4}>
                <Card>
                    <LoginComponent
                        onSuccess={() =>
                            dispatch(router.push("/bankAccountInfo"))
                        }
                        title="Anmelden"
                        confirmButton={{ label: "Anmelden" }}
                        userBanner={{ label: "Anmelden als" }}
                    />
                </Card>
            </GridCell>
        </GridPage>
    );
};
