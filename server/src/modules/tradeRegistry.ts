import { GraphQLYogaError } from "@graphql-yoga/node";
import { v4 as uuidv4 } from "uuid";
import {
    startOfToday,
    endOfToday,
    startOfDay,
    startOfHour,
    addHours,
    formatRFC3339,
} from "date-fns";
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
    /** create variable to use same time in every comparison */
    const now = new Date();
    const unionEntries = config.openingHours.dates
        .map((dateStr) => {
            const datetimes = [];
            const startDatetime = startOfHour(
                new Date(`${dateStr}T${config.openingHours.open}`)
            );
            const endDatetime = startOfHour(
                new Date(`${dateStr}T${config.openingHours.close}`)
            );
            for (
                let currDatetime = startDatetime;
                currDatetime <= endDatetime && currDatetime < now;
                currDatetime = addHours(currDatetime, 1)
            ) {
                datetimes.push(formatRFC3339(currDatetime));
            }
            return datetimes;
        })
        .flat()
        .map((datetime) =>
            knex.select(
                knex.raw(
                    "? as grossPrice, ? as netPrice, strftime('%Y-%m-%d %H:00:00', ?, 'localtime') as startOfHour, strftime('%Y-%m-%d %H:59:59', ?, 'localtime') AS endOfHour",
                    [0, 0, datetime, datetime]
                )
            )
        );

    const result = (await knex
        .from(
            knex
                .from(
                    knex
                        .from(
                            knex("purchaseTransactions")
                                .select(
                                    "grossPrice",
                                    "netPrice",
                                    knex.raw(
                                        "strftime('%Y-%m-%d %H:00:00', date, 'localtime') AS startOfHour"
                                    ),
                                    knex.raw(
                                        "strftime('%Y-%m-%d %H:59:59', date, 'localtime') AS endOfHour"
                                    )
                                )
                                .where({ companyId })
                                .unionAll(unionEntries)
                        )
                        .select("startOfHour", "endOfHour")
                        .groupBy("startOfHour")
                        .sum({
                            grossRevenue: "grossPrice",
                            netRevenue: "netPrice",
                        })
                        .as("stats")
                )
                .select(
                    "grossRevenue",
                    "netRevenue",
                    "startOfHour",
                    "salary",
                    knex.raw(
                        `CASE
                            WHEN worktimes.start > stats.endOfHour OR worktimes.end < stats.startOfHour THEN 0.0
                            WHEN worktimes.start >= stats.startOfHour AND worktimes.end <= stats.endOfHour THEN julianday(worktimes.end) - julianday(worktimes.start)
                            WHEN worktimes.start <  stats.startOfHour AND worktimes.end <= stats.endOfHour THEN julianday(worktimes.end) - julianday(stats.startOfHour)
                            WHEN worktimes.start >= stats.startOfHour AND worktimes.end >  stats.endOfHour THEN julianday(stats.endOfHour) - julianday(worktimes.start)
                            WHEN worktimes.start <  stats.startOfHour AND worktimes.end >  stats.endOfHour THEN 1.0/24
                        END worktimeInHour`.replaceAll(/\n\s*/g, " ")
                    )
                )
                .innerJoin(
                    // @ts-expect-error knex typing falsely don't allow customs tables in inner joyns
                    knex("worktimes")
                        .select(
                            knex.raw("datetime(start, 'localtime') start"),
                            knex.raw("datetime(end, 'localtime') end"),
                            "employments.salary"
                        )
                        .innerJoin(
                            "employments",
                            "worktimes.employmentId",
                            "employments.id"
                        )
                        .where({ companyId })
                        .as("worktimes")
                )
        )
        .select(
            "grossRevenue",
            "netRevenue",
            "startOfHour",
            knex.raw("netRevenue - SUM(worktimeInHour * 24 * salary) profit")
        )
        .groupBy("startOfHour")
        .sum({ staff: knex.raw("worktimeInHour * 24") })) as {
        startOfHour: string;
        grossRevenue: number;
        netRevenue: number;
        staff: number;
        profit: number;
    }[];
    return result;
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
