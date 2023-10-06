import type {
    IChangeDraftModel,
    IChangeTransactionModel,
    ICustomsTransactionModel,
    IPurchaseDraftModel,
    IPurchaseTransactionModel,
    ISalaryTransactionModel,
    ITransferTransactionModel,
    IUserSignature,
    TDraftModel,
    TTransactionModel,
} from "Types/models";
import type {
    IBankAccount,
    ISalaryTransaction,
    ITransferTransaction,
} from "Types/knex";
import type { IAppContext } from "Server";

import { all, isNull, isUndefined, map } from "lodash/fp";
import {
    EUserTypeTableMap,
    parseUserSignature,
    stringifyUserSignature,
} from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import { v4 as uuidv4 } from "uuid";
import { assert, GraphQLYogaError } from "Util/error";
import { TChangeInput, TCredentialsInput } from "Types/schema";
import { TNullable } from "Types";
import { assertCredentials, assertRole, checkRole } from "Util/auth";
import { values } from "Util/sql";
import { getUser } from "./users";
import { getCompany } from "./tradeRegistry";

async function getTransferTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<ITransferTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = knex("transferTransactions")
        .select("*")
        .where({ senderUserSignature: signatureString })
        .orWhere({ receiverUserSignature: signatureString });

    return (await query).map((raw) => ({
        type: "TRANSFER",
        ...raw,
        senderUserSignature: parseUserSignature(raw.senderUserSignature),
        receiverUserSignature: parseUserSignature(raw.receiverUserSignature),
    }));
}

async function getChangeTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<IChangeTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = knex("changeTransactions")
        .select("*")
        .whereNotNull("userSignature")
        .andWhere(
            (builder) =>
                !checkRole(user, "BANK") &&
                // eslint-disable-next-line no-void
                void builder.where({ userSignature: signatureString })
        );

    return (await query).map((raw) => ({
        type: "CHANGE",
        ...raw,
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        userSignature: parseUserSignature(raw.userSignature!),
    }));
}

async function getPurchaseTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<IPurchaseTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = knex("purchaseTransactions")
        .select("*")
        .where({ customerUserSignature: signatureString })
        .orWhere(
            (builder) =>
                user.type === "COMPANY" &&
                // eslint-disable-next-line no-void
                void builder.where({ companyId: user.id })
        );

    return (await query).map((raw) => ({
        type: "PURCHASE",
        ...raw,
        customerUserSignature: parseUserSignature(raw.customerUserSignature!),
    }));
}

async function getCustomsTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<ICustomsTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = checkRole(user, "BORDER_CONTROL")
        ? knex("customsTransactions")
        : knex("customsTransactions").where({ userSignature: signatureString });

    return (await query).map((raw) => ({
        type: "CUSTOMS",
        ...raw,
        userSignature: parseUserSignature(raw.userSignature),
    }));
}

async function getSalaryTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<ISalaryTransactionModel[]> {
    if (user.type === "GUEST") return [];

    const idColumn = user.type === "CITIZEN" ? "citizenId" : "companyId";
    const query = knex("employments")
        .where(`employments.${idColumn}`, user.id)
        .innerJoin(
            "salaryTransactions",
            "employments.id",
            "salaryTransactions.employmentId"
        )
        .select("salaryTransactions.*") as Promise<ISalaryTransaction[]>;

    return (await query).map((raw) => ({
        type: "SALARY",
        ...raw,
    }));
}

export async function getTransactionsByUser(
    ctx: IAppContext,
    user: IUserSignature
): Promise<TTransactionModel[]> {
    const query = Promise.all([
        getTransferTransactions(ctx, user),
        getChangeTransactions(ctx, user),
        getPurchaseTransactions(ctx, user),
        getCustomsTransactions(ctx, user),
        getSalaryTransactions(ctx, user),
    ]);

    // sort by ascending date
    return (await query).flat().sort(({ date: date1 }, { date: date2 }) => {
        if (date1 < date2) return -1;
        if (date1 > date2) return 1;
        return 0;
    });
}

export async function getChangeDrafts(
    { knex }: IAppContext,
    companyId: string
): Promise<IChangeDraftModel[]> {
    const user: IUserSignature = { type: "COMPANY", id: companyId };

    if (!checkRole(user, "BANK")) return [];

    const result = await knex("changeTransactions")
        .select("*")
        .whereNull("userSignature");

    return result.map((raw) => ({
        type: "CHANGE",
        ...raw,
    }));
}

export async function getDraftsByUser(
    ctx: IAppContext,
    companyId: string
): Promise<TDraftModel[]> {
    const query = Promise.all([getChangeDrafts(ctx, companyId)]);

    // sort by ascending date
    return (await query).flat().sort(({ date: date1 }, { date: date2 }) => {
        if (date1 < date2) return -1;
        if (date1 > date2) return 1;
        return 0;
    });
}

export async function payBonus(
    { knex }: IAppContext,
    companyId: string,
    value: number,
    employmentIds: number[]
): Promise<ISalaryTransactionModel[]> {
    // TODO: implement taxes
    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        // use knex.raw because knex doesn't support returning on sqlite
        const [companyResult] = (await trx.raw(
            `UPDATE bankAccounts
            SET balance = balance - :value
            WHERE id = (
                SELECT bankAccountId FROM companies WHERE id = :companyId
            )
            RETURNING balance`,
            { value, companyId }
        )) as { balance: number }[];
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        if (companyResult!.balance < 0)
            throw new GraphQLYogaError(
                `Not enough money to complete bonus payment`,
                { code: "BALANCE_TOO_LOW" }
            );

        // use knex.raw bacause knex doesn't support ctes
        const employeesResult = (await trx.raw(
            `WITH updates(employmentId) AS
                (VALUES
                    ${employmentIds.map(() => "(?)").join(",")}
                )
            UPDATE bankAccounts
            SET bankAccounts.balance = bankAccounts.balance + ?
            FROM (
                SELECT citizens.bankAccountId FROM updates
                INNER JOIN employments on updates.employmentId = employments.id
                INNER JOIN citizens on employments.citizenId = citizens.id
            ) as updates
            WHERE bankAccounts.id = updates.bankAccountId
            RETURNING updates.employmentId`,
            [...employmentIds, value]
        )) as { id: number }[];
        if (employeesResult.length !== employmentIds.length)
            throw new GraphQLYogaError(
                "Failed to update balance of all employees",
                { code: "BAD_EMPLOYMENT_ID" }
            );

        await trx("salaryTransactions").insert(
            employmentIds.map((employmentId) => ({
                date,
                employmentId,
                grossValue: value,
                netValue: value,
                worktimeId: null,
            }))
        );

        const returnQuery = trx("salaryTransactions")
            .select("*")
            .orderBy("id", "desc")
            .limit(employmentIds.length);
        return (await returnQuery).map((raw) => ({
            type: "SALARY",
            ...raw,
        }));
    });
}

export async function changeCurrencies(
    { knex, config }: IAppContext,
    change: TChangeInput
): Promise<IChangeDraftModel> {
    const date = formatDateTimeZ(new Date());

    assert(change.value > 0, "Value must be positive", "BAD_USER_INPUT");
    const valueReal =
        change.action === "VIRTUAL_TO_REAL"
            ? config.currencyExchange.realPerVirtual * change.value
            : change.value;
    const valueVirtual =
        change.action === "REAL_TO_VIRTUAL"
            ? config.currencyExchange.virtualPerReal * change.value
            : change.value;

    return knex.transaction(async (trx) => {
        const inserted = await trx("changeTransactions")
            .insert({
                date,
                action: change.action,
                valueVirtual,
                valueReal,
            })
            .returning("*");
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const raw = inserted[0]!;

        return { type: "CHANGE", ...raw };
    });
}
/** Pay a change transaction draft
 *
 * Authorized calls:
 * A company specifying no explicit user
 * The bank specifiying an explicit user
 */
export async function payChangeDraft(
    ctx: IAppContext,
    credentials: TNullable<TCredentialsInput>,
    id: number
): Promise<IChangeTransactionModel> {
    const { knex, session, config } = ctx;
    return knex.transaction(async (trx) => {
        const userSignature: IUserSignature = await (async () => {
            if (checkRole(session.userSignature, "BANK")) {
                assert(
                    !isNull(credentials),
                    "Must specify credentials",
                    "BAD_USER_INPUT"
                );
                await assertCredentials({ ...ctx, knex: trx }, credentials);
                return credentials;
            }

            assert(
                isNull(credentials),
                "Must not specify credentials",
                "BAD_USER_INPUT"
            );
            assertRole(session.userSignature, "USER");
            return session.userSignature;
        })();

        const draft = await trx("changeTransactions")
            .select("*")
            .where({ id })
            .first();
        assert(
            !isUndefined(draft),
            `Change transaction with id ${id} not found`,
            "CHANGE_TRANSACTION_NOT_FOUND"
        );
        assert(
            isNull(draft.userSignature),
            `Change transaction with id ${id} already paid`,
            "CHANGE_TRANSACTION_ALREADY_PAID"
        );

        const cost =
            draft.action === "VIRTUAL_TO_REAL"
                ? draft.valueVirtual
                : -draft.valueVirtual;

        await trx.raw(
            `
            UPDATE bankAccounts
            SET balance = balance + :cost
            FROM companies
            WHERE companies.bankAccountId = bankAccounts.id AND companies.id = :bankCompanyId
        `,
            { cost, bankCompanyId: config.server.bankCompanyId }
        );

        const user = await getUser({ ...ctx, knex: trx }, userSignature);
        const updatedUser = await trx("bankAccounts")
            .decrement("balance", cost)
            .where("id", user.bankAccountId)
            .returning("balance");
        assert(
            updatedUser[0]!.balance >= 0,
            "Not enough money to complete change.",
            "BALANCE_TOO_LOW"
        );

        const [updatedTransaction] = await trx("changeTransactions")
            .update({
                userSignature: stringifyUserSignature(userSignature),
            })
            .where({ id })
            .returning("*");
        return { type: "CHANGE", ...updatedTransaction!, userSignature };
    });
}
/** Delete a change transaction draft
 *
 * Authorized calls: The bank.
 */
export async function deleteChangeDraft(
    { knex, session }: IAppContext,
    id: number
): Promise<void> {
    assertRole(session.userSignature, "BANK");
    const draft = await knex("changeTransactions")
        .select("*")
        .where({ id })
        .first();
    assert(
        !isUndefined(draft),
        `Change transaction with id ${id} not found.`,
        "CHANGE_TRANSACTION_NOT_FOUND"
    );
    assert(
        isNull(draft.userSignature),
        `Change transaction with id ${id} already paid`,
        "CHANGE_TRANSACTION_ALREADY_PAID"
    );

    await knex("changeTransactions").delete().where({ id });
}

export async function transferMoney(
    { knex }: IAppContext,
    user: IUserSignature,
    receiver: IUserSignature,
    value: number,
    purpose: TNullable<string>
): Promise<ITransferTransactionModel> {
    if (value <= 0)
        throw new GraphQLYogaError("Value must be greater than 0.", {
            code: "BAD_USER_INPUT",
        });

    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        const senderResult = await trx("bankAccounts")
            .decrement("balance", value)
            .where(
                "id",
                trx(EUserTypeTableMap[user.type])
                    .select("bankAccountId")
                    .where("id", user.id)
            )
            .andWhere("balance", ">=", value);
        if (senderResult === 0)
            throw new GraphQLYogaError(
                `Not enough money to complete transfer`,
                { code: "BALANCE_TOO_LOW" }
            );
        const receiverResult = await trx("bankAccounts")
            .increment("balance", value)
            .where(
                "id",
                trx(EUserTypeTableMap[receiver.type])
                    .select("bankAccountId")
                    .where("id", receiver.id)
            );
        if (receiverResult === 0)
            throw new GraphQLYogaError(
                `User with signature ${stringifyUserSignature(
                    user
                )} doesn't exist`,
                { code: "USER_NOT_FOUND" }
            );

        await trx("transferTransactions").insert({
            date,
            senderUserSignature: stringifyUserSignature(user),
            receiverUserSignature: stringifyUserSignature(receiver),
            value,
            purpose,
        });
        const raw = (await trx("transferTransactions")
            .select("*")
            .orderBy("id", "desc")
            .first()) as ITransferTransaction;
        return {
            type: "TRANSFER",
            ...raw,
            senderUserSignature: parseUserSignature(raw.senderUserSignature),
            receiverUserSignature: parseUserSignature(
                raw.receiverUserSignature
            ),
        };
    });
}

export async function sell(
    ctx: IAppContext,
    companyId: string,
    items: { productId: string; amount: number }[],
    discount: TNullable<number>
): Promise<IPurchaseDraftModel> {
    const { knex } = ctx;
    return knex.transaction(async (trx) => {
        // TODO: implement taxes
        await getCompany({ ...ctx, knex: trx }, companyId); // check company exists
        assert(
            isNull(discount) || discount > 0,
            "Discound must be positive or omitted",
            "BAD_USER_INPUT"
        );
        assert(
            all((item) => item.amount > 0, items),
            "Amount of items must be positive",
            "BAD_USER_INPUT"
        );
        const date = formatDateTimeZ(new Date());

        const itemsTable = map((_) => [_.productId, _.amount], items);
        const withPrices = (await trx.raw(
            `WITH purchaseProducts(productId, amount) AS (:values)
            SELECT purchaseProducts.productId, purchaseProducts.amount, products.price
            FROM purchaseProducts
            INNER JOIN products on products.id = purchaseProducts.productId`,
            { values: values(trx, itemsTable) }
        )) as { productId: string; amount: number; price: number }[];
        assert(
            withPrices.length === items.length,
            "One of the product doesn't exist",
            "PRODUCT_NOT_FOUND"
        );

        const totalPrice = withPrices.reduce(
            (total, _) => total + _.amount * _.price,
            0
        );

        const inserted = await trx("purchaseTransactions")
            .insert({
                date,
                companyId,
                grossPrice: totalPrice,
                netPrice: totalPrice,
                discount,
            })
            .returning("*");
        const draft = inserted[0]!;
        await trx("productSales").insert(
            withPrices.map(({ productId, amount, price }) => ({
                purchaseId: draft.id,
                productId,
                amount,
                grossRevenue: amount * price,
            }))
        );
        return { type: "PURCHASE", ...draft };
    });
}
export async function payPurchaseDraft(
    ctx: IAppContext,
    id: number,
    credentials: TNullable<TCredentialsInput>
): Promise<IPurchaseTransactionModel> {
    const { knex, session } = ctx;
    return knex.transaction(async (trx) => {
        const [draft] = await trx("purchaseTransactions")
            .select("*")
            .where({ id });
        assert(
            !isUndefined(draft),
            `Purchase transaction with id ${id} not found`,
            "PURCHASE_TRANSACTION_NOT_FOUND"
        );
        assert(
            isNull(draft.customerUserSignature),
            `Purchase transaction with id ${id} already paid`,
            "PURCHASE_TRANSACTION_ALREADY_PAID"
        );

        const customerUserSignature: IUserSignature = await (async () => {
            if (
                checkRole(session.userSignature, "COMPANY") &&
                session.userSignature.id === draft.companyId
            ) {
                assert(
                    !isNull(credentials),
                    "Must specify credentials",
                    "BAD_USER_INPUT"
                );
                await assertCredentials({ ...ctx, knex: trx }, credentials);
                return credentials;
            }

            assert(
                isNull(credentials),
                "Must no specify credentials",
                "BAD_USER_INPUT"
            );
            assertRole(session.userSignature, "USER");
            return session.userSignature;
        })();

        await trx.raw(
            `
            UPDATE bankAccounts
            SET balance = balance + :netPrice
            FROM companies
            WHERE companies.bankAccountId = bankAccounts.id AND companies.id = :companyId
        `,
            draft
        );

        const customer = await getUser(
            { ...ctx, knex: trx },
            customerUserSignature
        );
        const updatedCustomer = await trx("bankAccounts")
            .decrement("balance", draft.grossPrice)
            .where("id", customer.bankAccountId)
            .returning("balance");
        assert(
            updatedCustomer[0]!.balance >= 0,
            "Not enough money to complete Purchase.",
            "BALANCE_TOO_LOW"
        );

        const [raw] = await trx("purchaseTransactions")
            .update({
                customerUserSignature: stringifyUserSignature(
                    customerUserSignature
                ),
            })
            .where({ id: draft.id })
            .returning("*");
        return {
            type: "PURCHASE",
            ...raw!,
            customerUserSignature,
        };
    });
}
export async function deletePurchaseDraft(
    { knex, session }: IAppContext,
    id: number
): Promise<void> {
    return knex.transaction(async (trx) => {
        const [draft] = await trx("purchaseTransactions")
            .select("*")
            .where({ id });
        assert(
            !isUndefined(draft),
            `Purchase transaction with id ${id} not found`,
            "PURCHASE_TRANSACTION_NOT_FOUND"
        );
        assert(
            isNull(draft.customerUserSignature),
            `Purchase transaction with id ${id} already paid`,
            "PURCHASE_TRANSACTION_ALREADY_PAID"
        );

        assertRole(session.userSignature, "COMPANY");
        assert(
            session.userSignature.id === draft.companyId,
            "Not logged in as correct user",
            "PERMISSION_DENIED"
        );

        await knex("purchaseTransactions").delete().where({ id });
    });
}
export async function warehousePurchase(
    ctx: IAppContext,
    items: { productId: string; amount: number }[]
): Promise<IPurchaseTransactionModel> {
    const { session, knex } = ctx;
    assertRole(session.userSignature, "COMPANY");

    const draft = await sell(ctx, session.userSignature.id, items, null);
    const transaction = await payPurchaseDraft(ctx, draft.id, null);
    await knex("warehouseOrders").insert({ purchaseId: transaction.id });

    return transaction;
}

export async function createBankAccount(
    { knex }: IAppContext,
    initBalance: number
): Promise<IBankAccount> {
    const id = uuidv4();
    await knex("bankAccounts").insert({
        id: uuidv4(),
        balance: initBalance,
        redemptionBalance: 0,
    });
    return knex("bankAccounts")
        .select("*")
        .where("id", id)
        .first() as Promise<IBankAccount>;
}
