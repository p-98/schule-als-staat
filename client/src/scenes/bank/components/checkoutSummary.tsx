// local
import config from "Config";
import { DisplayInfo } from "Components/displayInfo/displayInfo";
import { IChangeCurrenciesInfo } from "../types";

import styles from "../bank.module.css";

export interface ICheckoutSummaryProps {
    info: IChangeCurrenciesInfo;
}
export const CheckoutSummary: React.FC<ICheckoutSummaryProps> = ({ info }) => (
    <div className={styles["bank-checkout-summary"]}>
        <DisplayInfo
            label="Bezahlen"
            className={styles["bank-checkout-summary__value"]}
            icon="keyboard_arrow_left"
        >
            {info.baseValue}
            {config.currencies[info.baseCurrency].symbol}
        </DisplayInfo>
        <DisplayInfo
            label="Erhalten"
            className={styles["bank-checkout-summary__value"]}
            icon="keyboard_arrow_right"
        >
            {info.targetValue}
            {config.currencies[info.targetCurrency].symbol}
        </DisplayInfo>
    </div>
);
