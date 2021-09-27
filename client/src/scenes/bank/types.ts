// local
import config from "Config";

export interface IChangeCurrenciesInfo {
    baseCurrency: keyof typeof config.currencies;
    baseValue: number;

    targetCurrency: keyof typeof config.currencies;
    targetValue: number;
}
