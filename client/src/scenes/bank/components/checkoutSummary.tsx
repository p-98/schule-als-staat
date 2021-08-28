import { TextField } from "@rmwc/textfield";

// textfield imports
import "@material/textfield/dist/mdc.textfield.css";
import "@material/floating-label/dist/mdc.floating-label.css";
import "@material/notched-outline/dist/mdc.notched-outline.css";
import "@material/line-ripple/dist/mdc.line-ripple.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import config from "Config";
import { IChangeCurrenciesInfo } from "../types";

interface ICheckoutSummaryProps {
    info: IChangeCurrenciesInfo;
}
const CheckoutSummary: React.FC<ICheckoutSummaryProps> = ({ info }) => (
    <>
        <TextField
            disabled
            label={`von ${config.currencies[info.baseCurrency].short}`}
            value={info.baseValue}
        />
        <TextField
            disabled
            label={`in ${config.currencies[info.targetCurrency].short}`}
            value={info.targetValue}
        />
    </>
);
export default CheckoutSummary;
