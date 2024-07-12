// local
import type { IWarehouseOrderFragment } from "../warehouse.data";

export const applyDateFilter = (
    data: IWarehouseOrderFragment[],
    date: string
): IWarehouseOrderFragment[] =>
    data.filter((fragment) => fragment.dateFor === date);

export const applyCompanyFilter = (
    data: IWarehouseOrderFragment[],
    company: string
): IWarehouseOrderFragment[] =>
    data.filter(
        ({ customer }) =>
            customer.name.startsWith(company) || customer.id.startsWith(company)
    );
