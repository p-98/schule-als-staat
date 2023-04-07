import { GraphQLYogaError } from "@graphql-yoga/node";
import { v4 as uuidv4 } from "uuid";
import {
    startOfToday,
    endOfToday,
    startOfDay,
    formatRFC3339,
    formatISO,
} from "date-fns";
import { eachHourOfInterval, addHours } from "date-fns/fp";
import { eq, filter, keyBy, map, negate, pipe, zip } from "lodash/fp";
import { knex } from "Database";
import {
    ICompanyStatsFragmentModel,
    ICompanyUserModel,
    IEmploymentModel,
    IEmploymentOfferModel,
    IProductModel,
    IProductStatsFragmentModel,
    IPurchaseItemModel,
    IUserSignature,
    IWorktimeModel,
} from "Types/models";
import { TCreateEmploymentOfferInput } from "Types/schema";
import { IProduct, IProductSale } from "Types/knex";
import config from "Config";
import { TNullable } from "Types";
import {
    startOfHour as sqlStartOfHour,
    clamp,
    unixepochDiff,
    values,
} from "Util/sql";
import { toISOString, parseDateAndTime } from "Util/date";

export async function getCompany(id: string): Promise<ICompanyUserModel> {
    const raw = await knex("companies")
        .first()
        .where({ id })
        .innerJoin(
            "bankAccounts",
            "companies.bankAccountId",
            "bankAccounts.id"
        );

    if (!raw)
        throw new GraphQLYogaError(`Company with id ${id} not found`, {
            code: "COMPANY_NOT_FOUND",
        });

    return {
        type: "COMPANY",
        ...raw,
    };
}

export async function getProduct(id: string): Promise<IProductModel> {
    const raw = await knex("products").select("*").where({ id }).first();

    if (!raw)
        throw new GraphQLYogaError(`Product with id ${id} not found`, {
            code: "PRODUCT_NOT_FOUND",
        });

    return raw;
}

export async function getProducts(companyId: string): Promise<IProductModel[]> {
    return knex("products")
        .select("*")
        .where({ companyId })
        .andWhere({ deleted: false });
}

export async function getEmployment(id: number): Promise<IEmploymentModel> {
    const raw = await knex("employments").select("*").where({ id }).first();

    if (!raw)
        throw new GraphQLYogaError(`Employment with id ${id} not found`, {
            code: "EMPLOYMENT_NOT_FOUND",
        });

    return raw;
}

export async function getEmployer(
    companyId: string
): Promise<IEmploymentModel> {
    const raw = await knex("employments")
        .select("*")
        .where({ companyId })
        .andWhere({ employer: true })
        .first();

    if (!raw)
        throw new Error(
            `No employer found for company with id '${companyId}'. This indicates a corrupt database state, as every company founder should also be saved as its employer.`
        );

    return raw;
}

export async function getEmployments(
    user: IUserSignature & { type: "GUEST" }
): Promise<[never]>;
export async function getEmployments(
    user: IUserSignature & { type: "CITIZEN" }
): Promise<[IEmploymentModel]>;
export async function getEmployments(
    user: IUserSignature & { type: "COMPANY" }
): Promise<IEmploymentModel[]>;
export async function getEmployments(
    user: IUserSignature
): Promise<IEmploymentModel[]>;
export async function getEmployments(
    user: IUserSignature
): Promise<IEmploymentModel[]> {
    if (user.type === "GUEST") return [];

    const query = knex("employments")
        .select("*")
        .where(user.type === "CITIZEN" ? "employeeId" : "companyId", user.id)
        .andWhere("cancelled", false);

    return query;
}

export async function getCompanyStats(
    companyId: string
): Promise<ICompanyStatsFragmentModel[]> {
    const today = formatISO(new Date(), { representation: "date" });
    const openInterval = {
        start: parseDateAndTime(today, config.openingHours.open),
        end: parseDateAndTime(today, config.openingHours.close),
    };
    const startOfHours = pipe(
        eachHourOfInterval,
        filter<Date>(negate(eq(openInterval.end)))
    )(openInterval);
    const hoursStartEnd = zip(
        map(toISOString, startOfHours),
        map(pipe(addHours(1), toISOString), startOfHours)
    ) as [string, string][];

    return knex.transaction(async (trx) => {
        const clampToHour = (x: string) => clamp(x, "hours.start", "hours.end");
        const staffSql = `
        with
        hours(start, end) as (:values),
        withRatio as (
            select
                hours.start as startOfHour,
                st.grossValue as shiftSalary,
                ${unixepochDiff(
                    clampToHour("worktimes.end"),
                    clampToHour("worktimes.start")
                )} / 3600.0 as ratio
            from hours
            inner join employments on employments.companyId = :companyId
            inner join salaryTransactions as st on st.employmentId = employments.id
            inner join worktimes on worktimes.id = st.worktimeId),
        withSalary as
            (select startOfHour, ratio, shiftSalary * ratio as hourSalary from withRatio)
        select startOfHour, sum(ratio) as staff, sum(hourSalary) as cost
        from withSalary
        group by startOfHour
    `.replaceAll(/\n\s*/g, " ");
        const staffResult = (await trx.raw(staffSql, {
            values: values(hoursStartEnd),
            companyId,
        })) as { startOfHour: string; staff: number; cost: number }[];

        const revenueResult = (await trx("purchaseTransactions")
            .select(knex.raw(`${sqlStartOfHour("date")} as startOfHour`))
            .where({ companyId })
            .andWhereBetween("date", [
                startOfToday().toISOString(),
                endOfToday().toISOString(),
            ])
            .groupBy("startOfHour")
            .sum({ grossRevenue: "grossPrice" })
            .sum({ netRevenue: "netPrice" })) as unknown as {
            startOfHour: string;
            grossRevenue: number;
            netRevenue: number;
        }[];
        const revenueDic = keyBy("startOfHour", revenueResult);

        return staffResult.map(({ startOfHour, staff, cost: staffCost }) => ({
            startOfHour,
            staff,
            staffCost,
            grossRevenue: revenueDic[startOfHour]?.grossRevenue ?? 0,
            netRevenue: revenueDic[startOfHour]?.netRevenue ?? 0,
            profit: (revenueDic[startOfHour]?.netRevenue ?? 0) - staffCost,
        }));
    });
}

export async function getWorktimeForDay(
    employmentId: number,
    /** only the day is relevant */
    date: string
): Promise<number> {
    const query = knex
        .from(
            knex("worktimes")
                .select(
                    "start",
                    "end",
                    knex.raw(
                        "strftime('%Y-%m-%d', start, 'localtime') startDate"
                    ),
                    knex.raw("strftime('%Y-%m-%d', end, 'localtime') endDate")
                )
                .whereNotNull("end")
                .andWhere({ employmentId })
        )
        .select(
            knex.raw(
                `SUM(
                    CASE
                        WHEN startDate > :date OR  endDate < :date THEN 0.0
                        WHEN startDate < :date AND endDate > :date THEN 1.0
                        WHEN startDate < :date AND endDate = :date THEN julianday(end, 'localtime') - julianday(:date)
                        WHEN startDate = :date AND endDate > :date THEN julianday(:date, '+1 day') - julianday(start, 'localtime')
                        WHEN startDate = :date AND endDate = :date THEN julianday(end, 'localtime') - julianday(start, 'localtime')
                    END
                ) * 86400 worktime`.replaceAll(/\n\s*/g, " "),
                {
                    date: formatRFC3339(startOfDay(new Date(date))),
                }
            )
        )
        .first() as unknown as Promise<{ worktime: number }>;

    return Math.round((await query).worktime);
}

export async function getPurchaseItems(
    purchaseId: number
): Promise<IPurchaseItemModel[]> {
    return knex("productSales")
        .select("productId", "amount")
        .where({ purchaseId });
}

export async function getSalesToday(productId: string): Promise<number> {
    const query = knex
        .from(
            knex("productSales")
                .select(
                    knex.ref("amount").withSchema("productSales"),
                    knex.ref("date").withSchema("purchaseTransactions")
                )
                .where({ productId })
                .innerJoin(
                    "purchaseTransactions",
                    "productSales.purchaseId",
                    "purchaseTransactions.id"
                )
        )
        .sum({ salesToday: "amount" })
        .where("date", ">=", startOfToday())
        .first();
    return (await query)?.salesToday as number;
}

export async function getSalesTotal(productId: string): Promise<number> {
    const query = knex("productSales")
        .sum({ salesTotal: "amount" })
        .where({ productId })
        .first();
    return (await query)?.salesTotal as number;
}

/** Return total sales on the first day, and the average of the past days otherwise */
export async function getSalesPerDay(productId: string): Promise<number> {
    const result = (await knex
        .from(
            knex("productSales")
                .where({ productId })
                .innerJoin(
                    "purchaseTransactions",
                    "productSales.purchaseId",
                    "purchaseTransactions.id"
                )
                .sum({
                    salesExcludingToday: knex.raw(
                        "CASE WHEN purchaseTransactions.date < ? THEN productSales.amount END",
                        [formatRFC3339(startOfToday())]
                    ),
                    salesToday: knex.raw(
                        "CASE WHEN purchaseTransactions.date >= ? THEN productSales.amount END",
                        [formatRFC3339(startOfToday())]
                    ),
                })
        )
        .select(
            "*",
            knex
                .from(
                    knex("purchaseTransactions")
                        .select("date")
                        .where("date", "<", formatRFC3339(startOfToday()))
                        .groupBy("date")
                )
                .count({ dateCountExcludingToday: "date" })
                .as("dateCountExcludingToday")
        )
        .first()) as {
        dateCountExcludingToday: number;
        salesToday: number;
        salesExcludingToday: number;
    };

    if (result.dateCountExcludingToday === 0) return result.salesToday;
    return result.salesExcludingToday / result.dateCountExcludingToday;
}

export async function getGrossRevenueTotal(productId: string): Promise<number> {
    const query = knex("productSales")
        .where({ productId })
        .sum({ grossRevenueTotal: "grossRevenue" })
        .first();
    return (await query)?.grossRevenueTotal as number;
}

export async function getProductStats(
    productId: string
): Promise<IProductStatsFragmentModel[]> {
    const query = knex
        .from<IProductSale & { startOfHour: string }>(
            knex("productSales")
                .select(
                    "*",
                    knex.raw(
                        "strftime('%Y-%m-%d %H:00:00.000', purchaseTransactions.date, 'localtime') AS startOfHour"
                    )
                )
                .where({ productId })
                .innerJoin(
                    "purchaseTransactions",
                    "productSales.purchaseId",
                    "purchaseTransactions.id"
                )
        )
        .select("startOfHour")
        .groupBy("startOfHour")
        .sum({ sales: "amount", grossRevenue: "grossRevenue" });

    return (await query).map((raw) => ({
        ...raw,
        sales: raw.sales as number,
        grossRevenue: raw.grossRevenue as number,
    }));
}

export async function getWorktime(id: number): Promise<IWorktimeModel> {
    const raw = await knex("worktimes").select("*").where({ id }).first();

    if (!raw)
        throw new GraphQLYogaError(`Worktime with id ${id} not found.`, {
            code: "WORKTIME_NOT_FOUND",
        });

    return raw;
}

export async function createEmploymentOffer(
    companyId: string,
    offer: TCreateEmploymentOfferInput
): Promise<IEmploymentOfferModel> {
    return knex("employmentOffers").insert({
        ...offer,
        companyId,
        state: "PENDING",
    });
}

export async function acceptEmploymentOffer(
    citizenId: string,
    id: number
): Promise<IEmploymentOfferModel> {
    const offer = await knex("employmentOffers")
        .select("*")
        .where({ id })
        .first();

    if (!offer)
        throw new GraphQLYogaError(`EmploymentOffer with id ${id} not found`, {
            code: "EMPLOYMENT_OFFER_NOT_FOUND",
        });
    if (offer.citizenId !== citizenId)
        throw new GraphQLYogaError("Not logged in as correct user", {
            code: "PERMISSION_DENIED",
        });
    if (offer.state !== "PENDING")
        throw new GraphQLYogaError(
            `EmploymentOffer with id ${id} not rejected`,
            {
                code: "EMPLOYMENT_OFFER_NOT_REJECTED",
            }
        );

    await knex.transaction(async (trx) =>
        Promise.all([
            trx("employmentOffers").update({ state: "ACCEPTED" }).where({ id }),
            trx("employments").insert({
                ...offer,
                employer: false,
                cancelled: false,
            }),
        ])
    );

    return { ...offer, state: "ACCEPTED" };
}

export async function rejectEmploymentOffer(
    citizenId: string,
    id: number,
    rejectionReason: TNullable<string>
): Promise<IEmploymentOfferModel> {
    const offer = await knex("employmentOffers")
        .select("*")
        .where({ id })
        .first();

    if (!offer)
        throw new GraphQLYogaError(`EmploymentOffer with id ${id} not found`, {
            code: "EMPLOYMENT_OFFER_NOT_FOUND",
        });
    if (offer.citizenId !== citizenId)
        throw new GraphQLYogaError("Not logged in as correct user", {
            code: "PERMISSION_DENIED",
        });
    if (offer.state !== "PENDING")
        throw new GraphQLYogaError(
            `EmploymentOffer with id ${id} not rejected`,
            {
                code: "EMPLOYMENT_OFFER_NOT_REJECTED",
            }
        );

    await knex("employmentOffers").update({
        state: "REJECTED",
        rejectionReason,
    });

    return { ...offer, state: "REJECTED", rejectionReason };
}

export async function deleteEmploymentOffer(
    companyId: string,
    id: number
): Promise<void> {
    const offer = await knex("employmentOffers")
        .select("companyId", "state")
        .where({ id })
        .first();

    if (!offer)
        throw new GraphQLYogaError(`EmploymentOffer with id ${id} not found`, {
            code: "EMPLOYMENT_OFFER_NOT_FOUND",
        });
    if (offer.companyId !== companyId)
        throw new GraphQLYogaError("Not logged in as correct user", {
            code: "PERMISSION_DENIED",
        });
    if (offer.state !== "REJECTED")
        throw new GraphQLYogaError(
            `EmploymentOffer with id ${id} not rejected`,
            {
                code: "EMPLOYMENT_OFFER_NOT_REJECTED",
            }
        );

    await knex("employmentOffers").update({ state: "DELETED" }).where({ id });
}

export async function cancelEmployment(
    userSignature: IUserSignature & { type: "CITIZEN" | "COMPANY" },
    id: number
): Promise<void> {
    const employment = await knex("employments")
        .select("companyId", "citizenId", "cancelled")
        .where({ id })
        .first();

    if (!employment)
        throw new GraphQLYogaError(`Employment with id ${id} not found`, {
            code: "EMPLOYMENT_NOT_FOUND",
        });
    const idProperty =
        userSignature.type === "CITIZEN" ? "citizenId" : "companyId";
    if (employment[idProperty] !== userSignature.id)
        throw new GraphQLYogaError("Not logged in as correct user", {
            code: "PERMISSION_DENIED",
        });
    if (employment.cancelled)
        throw new GraphQLYogaError(
            `EmploymentOffer with id ${id} not rejected`,
            {
                code: "EMPLOYMENT_ALREADY_CANCELLED",
            }
        );

    await knex("employments").update({ cancelled: true }).where({ id });
}

export async function addProduct(
    companyId: string,
    name: string,
    price: number
): Promise<IProductModel> {
    const id = uuidv4();
    return knex.transaction(async (trx) => {
        await trx("products").insert({
            id,
            companyId,
            name,
            price,
            deleted: false,
        });
        return trx("products")
            .select("*")
            .where({ id })
            .first() as Promise<IProduct>;
    });
}

export async function editProduct(
    companyId: string,
    id: string,
    name: TNullable<string>,
    price: TNullable<number>
): Promise<IProductModel> {
    return knex.transaction(async (trx) => {
        const affected = await trx("products")
            .update({
                ...(name && { name }),
                ...(price && { price }),
            })
            .where({ id, companyId, deleted: false });
        if (affected === 0)
            throw new GraphQLYogaError(`Product with id ${id} not found.`, {
                code: "PRODUCT_NOT_FOUND",
            });

        return trx("products")
            .select("*")
            .where({ id })
            .first() as Promise<IProduct>;
    });
}

export async function removeProduct(
    companyId: string,
    id: string
): Promise<void> {
    return knex.transaction(async (trx) => {
        const affected = await trx("products")
            .update({ deleted: true })
            .where({ id, companyId });
        if (affected === 0)
            throw new GraphQLYogaError(`Product with id ${id} not found.`, {
                code: "PRODUCT_NOT_FOUND",
            });
    });
}
