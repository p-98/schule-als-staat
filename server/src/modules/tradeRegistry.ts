import type { IAppContext } from "Server";

import { assert, GraphQLYogaError, hasCode } from "Util/error";
import { v4 as uuidv4 } from "uuid";
import { startOfDay } from "date-fns";
import { addDays, endOfDay } from "date-fns/fp";
import {
    keyBy,
    pipe,
    pick,
    isUndefined,
    flatMap,
    curry,
    filter,
    assign,
} from "lodash/fp";
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
import {
    TEmploymentOfferInput,
    TEmploymentOfferStateCitizenInput,
    TEmploymentOfferStateCompanyInput,
    TProductInput,
} from "Types/schema";
import { IBankAccount, ICompany } from "Types/knex";
import { TNullable } from "Types";
import {
    startOfHour as sqlStartOfHour,
    clamp,
    unixepochDiff,
    values,
} from "Util/sql";
import { formatDateTimeZ, formatDateZ, openingHours } from "Util/date";
import { assertRole } from "Util/auth";

/* Helper functions
 */
const addType: (company: Omit<ICompanyUserModel, "type">) => ICompanyUserModel =
    assign({ type: "COMPANY" } as const);

/* Query functions
 */

export async function getCompany(
    { knex }: IAppContext,
    id: string,
    options?: { code?: string }
): Promise<ICompanyUserModel> {
    const raw = await knex("companies")
        // select order important, because both tables contain id field
        .select<ICompany & IBankAccount>("bankAccounts.*", "companies.*")
        .where("companies.id", id)
        .innerJoin("bankAccounts", "companies.bankAccountId", "bankAccounts.id")
        .first();
    assert(
        !!raw,
        `Company with id ${id} not found`,
        options?.code ?? "COMPANY_NOT_FOUND"
    );
    return addType(raw);
}

export async function getAllComnpanies(
    ctx: IAppContext
): Promise<ICompanyUserModel[]> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "TAX_OFFICE", { allowAdmin: true });

    const raw = await knex("companies")
        // select order important, because both tables contain id field
        .select<(ICompany & IBankAccount)[]>("bankAccounts.*", "companies.*")
        .innerJoin(
            "bankAccounts",
            "companies.bankAccountId",
            "bankAccounts.id"
        );
    return raw.map(addType);
}

export async function getProduct(
    { knex }: IAppContext,
    id: string,
    revision?: string
): Promise<IProductModel> {
    const product = !isUndefined(revision)
        ? await knex("products").where({ id, revision }).first()
        : await knex("products").where({ id, deleted: false }).first();
    assert(
        !isUndefined(product),
        `Product with id ${id} not found`,
        "PRODUCT_NOT_FOUND"
    );
    return product;
}

export async function getProducts(
    { knex }: IAppContext,
    companyId: string
): Promise<IProductModel[]> {
    return knex("products")
        .select("*")
        .where({ companyId })
        .andWhere({ deleted: false });
}

export async function getEmployment(
    { knex }: IAppContext,
    id: number
): Promise<IEmploymentModel> {
    const raw = await knex("employments").select("*").where({ id }).first();

    if (!raw)
        throw new GraphQLYogaError(`Employment with id ${id} not found`, {
            code: "EMPLOYMENT_NOT_FOUND",
        });

    return raw;
}

export async function getEmployer(
    { knex }: IAppContext,
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
    ctx: IAppContext,
    user: IUserSignature & { type: "CITIZEN" }
): Promise<[IEmploymentModel]>;
export async function getEmployments(
    ctx: IAppContext,
    user: IUserSignature & { type: "COMPANY" }
): Promise<IEmploymentModel[]>;
export async function getEmployments(
    { knex }: IAppContext,
    user: IUserSignature & { type: "CITIZEN" | "COMPANY" }
): Promise<IEmploymentModel[]> {
    return knex("employments")
        .select("*")
        .where(user.type === "CITIZEN" ? "citizenId" : "companyId", user.id)
        .andWhere("cancelled", false);
}

export async function getEmploymentOffers(
    ctx: IAppContext,
    user: IUserSignature & { type: "CITIZEN" },
    state: TEmploymentOfferStateCitizenInput
): Promise<IEmploymentOfferModel[]>;
export async function getEmploymentOffers(
    ctx: IAppContext,
    user: IUserSignature & { type: "COMPANY" },
    state: TEmploymentOfferStateCompanyInput
): Promise<IEmploymentOfferModel[]>;
export async function getEmploymentOffers(
    { knex }: IAppContext,
    user: IUserSignature & { type: "CITIZEN" | "COMPANY" },
    state: TEmploymentOfferStateCitizenInput | TEmploymentOfferStateCompanyInput
): Promise<IEmploymentOfferModel[]> {
    return knex("employmentOffers")
        .select("*")
        .where(user.type === "CITIZEN" ? "citizenId" : "companyId", user.id)
        .andWhere("state", state);
}

export async function getCompanyStats(
    { knex, config }: IAppContext,
    companyId: string
): Promise<ICompanyStatsFragmentModel[]> {
    const now = new Date();
    const hoursStartEnd = openingHours(config, formatDateZ(now));

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
            left join employments on employments.companyId = :companyId
            left join salaryTransactions as st on st.employmentId = employments.id
            left join worktimes on worktimes.id = st.worktimeId),
        withSalary as
            (select startOfHour, ratio, shiftSalary * ratio as hourSalary from withRatio)
        select startOfHour, total(ratio) as staff, total(hourSalary) as cost
        from withSalary
        group by startOfHour
    `.replaceAll(/\n\s*/g, " ");
        const staffResult = (await trx.raw(staffSql, {
            values: values(knex, hoursStartEnd),
            companyId,
        })) as { startOfHour: string; staff: number; cost: number }[];

        const revenueResult = (await trx("purchaseTransactions")
            .select(knex.raw(`${sqlStartOfHour("date")} as startOfHour`))
            .where({ companyId })
            .andWhereBetween("date", [
                formatDateTimeZ(startOfDay(now)),
                formatDateTimeZ(endOfDay(now)),
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
    { knex }: IAppContext,
    employmentId: number,
    /** valid ISO 8601 string, only date is relevant */
    date: string
): Promise<number> {
    const startOfDate = startOfDay(new Date(date));
    const worktimeSql = unixepochDiff(
        clamp("worktimes.end", ":startOfDate", ":endOfDate"),
        clamp("coalesce(worktimes.start, :now)", ":startOfDate", ":endOfDate")
    );
    const { worktime } = (await knex("worktimes")
        .select(
            knex.raw(`total(${worktimeSql}) as worktime`, {
                startOfDate: formatDateTimeZ(startOfDate),
                endOfDate: pipe(addDays(1), formatDateTimeZ)(startOfDate),
                now: formatDateTimeZ(new Date()),
            })
        )
        .where({ employmentId })
        .first()) as unknown as { worktime: number };

    return Math.round(worktime);
}

export async function getPurchaseItems(
    { knex }: IAppContext,
    purchaseId: number
): Promise<IPurchaseItemModel[]> {
    return knex("productSales")
        .select("productId", "amount", "productRevision")
        .where({ purchaseId });
}

/** Get sales of product for current day
 *
 * Assumes productId to be valid.
 */
export async function getSalesToday(
    { knex }: IAppContext,
    productId: string
): Promise<number> {
    const query: { salesToday: number }[] = await knex.raw(
        `SELECT total(productSales.amount) as salesToday
        FROM productSales
        INNER JOIN purchaseTransactions
            ON productSales.purchaseId = purchaseTransactions.id
            AND date >= :startOfToday
        WHERE productSales.productId = :productId`,
        { productId, startOfToday: formatDateTimeZ(startOfDay(new Date())) }
    );
    return query[0]!.salesToday;
}

/** Get sales of product for all days
 *
 * Assumes productId to be valid.
 */
export async function getSalesTotal(
    { knex }: IAppContext,
    productId: string
): Promise<number> {
    const query: { salesTotal: number }[] = await knex.raw(
        `SELECT total(amount) as salesTotal
        FROM productSales
        WHERE productId = :productId`,
        { productId }
    );
    return query[0]!.salesTotal;
}

/** Return total sales on the first day, and the average of the past days otherwise
 *
 * Assumes productId to be valid.
 */
export async function getSalesPerDay(
    ctx: IAppContext,
    productId: string
): Promise<number> {
    const { knex, config } = ctx;
    /** Start of day in localtime */
    const startOfT0day = startOfDay(new Date());
    const beforeToday = pipe(
        (date: string) =>
            new Date(`${date}T00:00:00.000${config.openingHours.timezone}`),
        (_) => _ < startOfT0day
    );
    const pastDays = config.openingHours.dates.filter(beforeToday);

    const isFirstDay = pastDays.length === 0;
    if (isFirstDay) return getSalesToday(ctx, productId);

    const query: { salesPastDays: number }[] = await knex.raw(
        `SELECT total(productSales.amount) as salesPastDays
        FROM productSales
        INNER JOIN purchaseTransactions ON purchaseTransactions.id = productSales.purchaseId
        WHERE purchaseTransactions.date < :startOfToday`,
        { startOfToday: formatDateTimeZ(startOfT0day) }
    );
    return query[0]!.salesPastDays / pastDays.length;
}

/** Return total gross revenue for product
 *
 * Assumes productId to be valid.
 */
export async function getGrossRevenueTotal(
    { knex }: IAppContext,
    productId: string
): Promise<number> {
    const query: { grossRevenueTotal: number }[] = await knex.raw(
        `SELECT total(amount * price) as grossRevenueTotal
        FROM productSales
        WHERE productSales.productId = :productId
        INNER JOIN products
                ON productSales.productId = products.id
               AND productSales.productRevision = products.revision`,
        { productId }
    );
    return query[0]!.grossRevenueTotal;
}

/** Return array hour-wise statistics for product
 *
 * Assumes productId to be valid.
 */
export async function getProductStats(
    { knex, config }: IAppContext,
    productId: string
): Promise<IProductStatsFragmentModel[]> {
    const now = formatDateTimeZ(new Date());
    const fragments = pipe(
        flatMap(curry(openingHours)(config)),
        filter(([startOfHour]) => startOfHour < now)
    )(config.openingHours.dates);

    const query: {
        startOfHour: string;
        sales: number;
        grossRevenue: number;
    }[] = await knex.raw(
        `WITH fragments(startOfHour, endOfHour) AS :fragments
        SELECT fragments.startOfHour, total(amount) as sales, total(amount * price) as grossRevenue
        FROM fragments
        WHERE productSales.productId = :productId
        INNER JOIN purchaseTransactions
                ON fragments.startOfHour <= purchaseTransactions.date
               AND fragments.endOfHour   >= purchaseTransactions.date
        INNER JOIN productSales
                ON productSales.purchaseId = purchaseTransactions.id
        INNER JOIN products
                ON products.id = productSales.productId
               AND products.revision = productSales.productRevision
        GROUP BY fragments.startOfHour`,
        { fragments: values(knex, fragments), productId }
    );
    return query;
}

export async function getWorktime(
    { knex }: IAppContext,
    id: number
): Promise<IWorktimeModel> {
    const raw = await knex("worktimes").select("*").where({ id }).first();

    if (!raw)
        throw new GraphQLYogaError(`Worktime with id ${id} not found.`, {
            code: "WORKTIME_NOT_FOUND",
        });

    return raw;
}

/* Mutation functions
 */

export async function createEmploymentOffer(
    { knex }: IAppContext,
    companyId: string,
    offer: TEmploymentOfferInput
): Promise<IEmploymentOfferModel> {
    if (offer.minWorktime <= 0)
        throw new GraphQLYogaError("minWorktime must be positive", {
            code: "BAD_USER_INPUT",
        });
    if (offer.salary <= 0)
        throw new GraphQLYogaError("salary must be positive", {
            code: "BAD_USER_INPUT",
        });

    try {
        const inserted = await knex("employmentOffers")
            .insert({
                ...offer,
                companyId,
                state: "PENDING",
            })
            .returning("*");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return inserted[0]!;
    } catch (err) {
        if (hasCode(err) && err.code === "SQLITE_CONSTRAINT_FOREIGNKEY")
            throw new GraphQLYogaError(
                `Citizen with id ${offer.citizenId} does not exist`,
                { code: "CITIZEN_NOT_FOUND" }
            );
        throw err;
    }
}

export async function acceptEmploymentOffer(
    { knex }: IAppContext,
    citizenId: string,
    id: number
): Promise<IEmploymentModel> {
    return knex.transaction(async (trx) => {
        const offer = await trx("employmentOffers")
            .select("*")
            .where({ id })
            .first();

        if (!offer)
            throw new GraphQLYogaError(
                `EmploymentOffer with id ${id} not found`,
                {
                    code: "EMPLOYMENT_OFFER_NOT_FOUND",
                }
            );
        if (offer.citizenId !== citizenId)
            throw new GraphQLYogaError("Not logged in as correct user", {
                code: "PERMISSION_DENIED",
            });
        if (offer.state !== "PENDING")
            throw new GraphQLYogaError(
                `EmploymentOffer with id ${id} not rejected`,
                {
                    code: "EMPLOYMENT_OFFER_NOT_PENDING",
                }
            );

        const inserted = await trx("employments")
            .insert({
                ...pick(
                    ["companyId", "citizenId", "salary", "minWorktime"],
                    offer
                ),
                employer: false,
                cancelled: false,
            })
            .returning("*");
        await trx("employmentOffers")
            .update({ state: "ACCEPTED" })
            .where({ id })
            .returning("*");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return inserted[0]!;
    });
}

export async function rejectEmploymentOffer(
    { knex }: IAppContext,
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
            `EmploymentOffer with id ${id} not pending`,
            {
                code: "EMPLOYMENT_OFFER_NOT_PENDING",
            }
        );

    await knex("employmentOffers").update({
        state: "REJECTED",
        rejectionReason,
    });

    return { ...offer, state: "REJECTED", rejectionReason };
}

export async function deleteEmploymentOffer(
    { knex }: IAppContext,
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
    { knex }: IAppContext,
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

const assertProductInput = ({ name, price }: TProductInput) => {
    assert(name.trim() !== "", "Name must not be empty", "NAME_EMPTY");
    assert(price >= 0, "Price must not be negative", "PRICE_NEGATIVE");
};
const assertProductOwnership = (ctx: IAppContext, product: IProductModel) => {
    const { session } = ctx;
    assertRole(ctx, session.userSignature, "COMPANY");
    assert(
        product.companyId === session.userSignature.id,
        "You don't own this product",
        "PERMISSION_DENIED"
    );
};
export async function addProduct(
    ctx: IAppContext,
    productInput: TProductInput
): Promise<IProductModel> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "COMPANY");
    assertProductInput(productInput);

    const [product] = await knex("products")
        .insert({
            id: uuidv4(),
            revision: uuidv4(),
            companyId: session.userSignature.id,
            ...productInput,
            deleted: false,
        })
        .returning("*");
    return product!;
}
export async function editProduct(
    ctx: IAppContext,
    id: string,
    productInput: TProductInput
): Promise<IProductModel> {
    const { knex } = ctx;
    return knex.transaction(async (trx) => {
        const product = await getProduct({ ...ctx, knex: trx }, id); // checks product exists
        assertProductOwnership({ ...ctx, knex: trx }, product);

        assertProductInput(productInput);

        await trx("products").update("deleted", true).where({ id });
        const [newProduct] = await trx("products")
            .insert({
                id: product.id,
                revision: uuidv4(),
                companyId: product.companyId,
                ...productInput,
                deleted: false,
            })
            .returning("*");
        return newProduct!;
    });
}
export async function removeProduct(
    ctx: IAppContext,
    id: string
): Promise<void> {
    const { knex } = ctx;
    return knex.transaction(async (trx) => {
        const product = await getProduct({ ...ctx, knex: trx }, id); // checks product exists
        assertProductOwnership({ ...ctx, knex: trx }, product);

        await trx("products").update("deleted", true).where({ id });
    });
}
