import { useState } from "react";
import { GridCell } from "Components/material/grid";
import { Typography } from "Components/material/typography";
import {
    Card,
    CardActions,
    CardContent,
    CardActionIcons,
    CardActionIcon,
    CardInner,
    CardHeader,
} from "Components/material/card";

// local
import { DrawerAppBarHandle } from "Components/dynamicAppBar/presets";
import { GridPage } from "Components/page/page";
// import { useCompanyAdminRedirect } from "Utility/hooks/useRedirect";
import { IProduct } from "Utility/dataMockup";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import {
    SiblingTransitionBase,
    SiblingTransitionBaseElement,
    Modes,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";
import { Dot } from "Components/dot/dot";
import { parseCurrency } from "Utility/parseCurrency";
import { AddFab } from "./components/addFab";
import products from "./products.data";
import { Stats } from "./components/stats";
import { EditProduct } from "./components/editProduct";

import styles from "./products.module.css";

// const chunkSplit = <T, >(arr: T[], chunkSize): T[][] =>
//     Array(Math.ceil(arr.length / chunkSize))
//         .fill(0)
//         .map(() => arr.splice(0, chunkSize));

enum EDisplay {
    Default,
    // eslint-disable-next-line @typescript-eslint/no-shadow
    Stats,
    Edit,
}
interface IProductProps {
    product: IProduct;
}
const Product: React.FC<IProductProps> = ({ product }) => {
    const [display, setDisplay] = useState<EDisplay>(EDisplay.Default);

    return (
        <Card>
            <SiblingTransitionBase mode={Modes.xAxis} activeElement={display}>
                <SiblingTransitionBaseElement index={EDisplay.Default}>
                    <CardInner>
                        <CardHeader>{product.name}</CardHeader>
                        <CardContent>
                            <DisplayInfo label="Preis">
                                {parseCurrency(product.price)}
                            </DisplayInfo>
                        </CardContent>
                        <CardContent>
                            <Typography
                                use="body2"
                                theme="textSecondaryOnBackground"
                                style={{ textAlign: "center" }}
                            >
                                Heute 10x verkauft
                            </Typography>
                            <Typography
                                use="body2"
                                theme="textSecondaryOnBackground"
                                className={styles["product__stats"]}
                            >
                                <span>34 gesamt</span>
                                <Dot size={6} />
                                <span>12/Tag {"\u2300"}</span>
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <CardActionIcons>
                                <CardActionIcon
                                    onClick={() => setDisplay(EDisplay.Stats)}
                                    icon="insights"
                                />
                                <CardActionIcon
                                    onClick={() => setDisplay(EDisplay.Edit)}
                                    icon="edit"
                                />
                            </CardActionIcons>
                        </CardActions>
                    </CardInner>
                </SiblingTransitionBaseElement>
                <SiblingTransitionBaseElement index={EDisplay.Stats}>
                    <Stats onGoBack={() => setDisplay(EDisplay.Default)} />
                </SiblingTransitionBaseElement>
                <SiblingTransitionBaseElement index={EDisplay.Edit}>
                    <EditProduct
                        cancel={{
                            onCancel: () => setDisplay(EDisplay.Default),
                            icon: "arrow_back",
                            label: "Zurück",
                        }}
                        confirm={{
                            onConfirm: () => setDisplay(EDisplay.Default),
                            label: "Anwenden",
                            danger: true,
                        }}
                        product={product}
                        title="Bearbeiten"
                    />
                </SiblingTransitionBaseElement>
            </SiblingTransitionBase>
        </Card>
    );
};

export const Products: React.FC = () => {
    try {
        // useCompanyAdminRedirect();
    } catch (e) {
        return <div>Redirect failed</div>;
    }

    return (
        <>
            <GridPage>
                <DrawerAppBarHandle title="Produktverwaltung" />
                {products.map((product) => (
                    <GridCell span={4} key={product.id}>
                        <Product product={product} />
                    </GridCell>
                ))}
            </GridPage>
            <AddFab />
        </>
    );
};
