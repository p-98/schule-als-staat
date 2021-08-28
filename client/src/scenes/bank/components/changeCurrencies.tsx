import { GridCell } from "@rmwc/grid";
import { TextField } from "@rmwc/textfield";

// grid imports
import "@material/layout-grid/dist/mdc.layout-grid.css";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import {
    Card,
    CardHeader,
    CardContent,
    CardActions,
    CardActionButton,
} from "Components/card/card";
import config from "Config";

import pageGridStyles from "Components/pageGrid/pageGrid.module.css";

const RealToVirtual: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
        <CardHeader>
            {config.currencies.real.name} to {config.currencies.virtual.name}
        </CardHeader>
        <CardContent>
            <TextField
                label={`von ${config.currencies.real.short}`}
                value="1"
            />
            <TextField
                disabled
                label={`in ${config.currencies.virtual.short}`}
                value="3.141"
            />
        </CardContent>
        <CardActions fullBleed>
            <CardActionButton label="Wechsel buchen" trailingIcon="swap_vert" />
        </CardActions>
    </Card>
);

const VirtualToReal: React.FC = () => (
    <Card className={pageGridStyles["page-grid__cell-child"]}>
        <CardHeader>
            {config.currencies.virtual.name} to {config.currencies.real.name}
        </CardHeader>
        <CardContent>
            <TextField
                label={`von ${config.currencies.virtual.short}`}
                value="1"
            />
            <TextField
                disabled
                label={`in ${config.currencies.real.short}`}
                value="0.32"
            />
        </CardContent>
        <CardActions fullBleed>
            <CardActionButton label="Wechsel buchen" trailingIcon="swap_vert" />
        </CardActions>
    </Card>
);

const ChangeCurrencies: React.FC = () => (
    <>
        <GridCell desktop={2} tablet={0} phone={0} />
        <GridCell span={4}>
            <RealToVirtual />
        </GridCell>
        <GridCell span={4}>
            <VirtualToReal />
        </GridCell>
        <GridCell desktop={2} tablet={0} phone={0} />
    </>
);
export default ChangeCurrencies;
