import { IProduct, reassignIDs } from "Utility/dataMockup";

export const products = reassignIDs<
    IProduct & { revenue: number; sales: number }
>([
    {
        id: "",
        name: "Burger",
        price: 15.521,
        revenue: 500,
        sales: 50,
    },
    {
        id: "",
        name: "Pommes",
        price: 9.467,
        revenue: 340,
        sales: 34,
    },
    {
        id: "",
        name: "Cola",
        price: 6.235,
        revenue: 750,
        sales: 75,
    },
]);

const random = (min: number, max: number) => Math.random() * (max - min) + min;

export type TFinancesDataFragment = {
    staff: number;
    netRevenue: number;
    profit: number;
    date: Date;
};
export type TFinancesData = TFinancesDataFragment[];

export const genFinancesData = (): TFinancesData =>
    ["2020-06-13", "2020-06-14", "2020-06-17"].reduce<TFinancesData>(
        (arr, date) =>
            arr.concat(
                Array(7)
                    .fill(0)
                    .map((_, index) => {
                        const staff = Math.floor(random(1, 3));
                        const sales = Math.floor(random(10, 21));
                        const jsDate = new Date(date);
                        jsDate.setHours(index + 9);

                        return {
                            staff: staff * 20,
                            netRevenue: sales * 3,
                            profit: Math.floor(sales * 3 * 0.9 - staff * 20),
                            date: jsDate,
                        };
                    })
            ),
        []
    );

export const cumulateFinancesData = (
    financesData: TFinancesData
): TFinancesData =>
    Object.values(
        financesData.reduce<Record<string, TFinancesDataFragment>>(
            (obj, { date, ...fragment }) => {
                const dateStr = date.toDateString();

                if (!(dateStr in obj)) {
                    return {
                        ...obj,
                        [dateStr]: { ...fragment, date: new Date(dateStr) },
                    };
                }

                const dateObj = obj[dateStr] as TFinancesDataFragment;
                return {
                    ...obj,
                    [dateStr]: {
                        date: dateObj.date,
                        staff: dateObj.staff + fragment.staff,
                        netRevenue: dateObj.netRevenue + fragment.netRevenue,
                        profit: dateObj.profit + fragment.profit,
                    },
                };
            },
            {}
        )
    );
