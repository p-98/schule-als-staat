import type {
    IChangeTransactionDraftModel,
    IChangeTransactionModel,
    ICustomsTransactionModel,
    IPurchaseTransactionModel,
    ISalaryTransactionModel,
    ITransferTransactionModel,
    IUserSignature,
    TTransactionModel,
    TUserModel,
} from "Types/models";
import type {
    IBankAccount,
    IPurchaseTransaction,
    ISalaryTransaction,
    ITransferTransaction,
} from "Types/knex";
import type { IAppContext } from "Server";

import { isNull, isUndefined } from "lodash/fp";
import {
    EUserTypeTableMap,
    parseUserSignature,
    stringifyUserSignature,
} from "Util/parse";
import { formatDateTimeZ } from "Util/date";
import { v4 as uuidv4 } from "uuid";
import { assert, GraphQLYogaError } from "Util/error";
import { TChangeTransactionInput, TCredentialsInput } from "Types/schema";
import { TNullable } from "Types";
import { assertCredentials, assertRole, checkRole } from "Util/auth";
import { getUser } from "./users";

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
        .andWhere({ userSignature: signatureString });

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
        customerUserSignature: parseUserSignature(raw.customerUserSignature),
    }));
}

async function getCustomsTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<ICustomsTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = knex("customsTransactions")
        .select("*")
        .where({ userSignature: signatureString });

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
    change: TChangeTransactionInput
): Promise<IChangeTransactionDraftModel> {
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
export async function payChangeTransaction(
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
                await assertCredentials(ctx, credentials);
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

        await trx("bankAccounts")
            .increment("bankAccounts.balance", cost)
            .innerJoin(
                "companies",
                "companies.bankAccountId",
                "bankAccounts.id"
            )
            .where("companies.id", config.server.bankCompanyId);

        const updatedCompany = await trx("bankAccounts")
            .decrement("balance", cost)
            .where("id", (await getUser(ctx, userSignature)).bankAccountId)
            .returning("balance");
        assert(
            updatedCompany[0]!.balance >= 0,
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
    { knex }: IAppContext,
    companyId: string,
    customer: TUserModel,
    items: { productId: string; amount: number }[],
    discount: TNullable<number>
): Promise<IPurchaseTransactionModel> {
    // TODO: implement taxes
    if (discount && discount <= 0)
        throw new GraphQLYogaError(
            "Discount must be greater than 0 or omitted",
            { code: "BAD_USER_INPUT" }
        );
    if (items.find((item) => item.amount <= 0))
        throw new GraphQLYogaError("Amount of item must be greater than 0", {
            code: "BAD_USER_INPUT",
        });

    const date = formatDateTimeZ(new Date());
    return knex.transaction(async (trx) => {
        // use knex.raw bacause knex doesn't support ctes
        const prices = (await trx.raw(
            `WITH purchaseProducts(id, amount) AS
                (VALUES
                    ${items.map(() => "(?, ?)").join(",")}
                )
            SELECT purchaseProducts.id as productId, purchaseProducts.amount, products.price
            FROM purchaseProducts
            INNER JOIN products on products.id = purchaseProducts.id`
        )) as { productId: string; amount: number; price: number }[];
        if (prices.length < items.length)
            throw new GraphQLYogaError("One of the products doesn't exist", {
                code: "PRODUCT_NOT_FOUND",
            });

        const totalPrice = prices.reduce(
            (prev, item) => prev + item.amount * item.price,
            0
        );

        // use knex.raw because knex doesn't support returning on sqlite
        const customerTable = EUserTypeTableMap[customer.type];
        const [customerResult] = (await trx.raw(
            `UPDATE bankAccounts
            SET balance = balance - :totalPrice
            WHERE (
                SELECT bankAccountId FROM ${customerTable} WHERE id = :customerId
            )
            RETURNING balance`,
            { totalPrice, customerId: customer.id }
        )) as [{ balance: number }];
        // existance of customer already checked cause userModel is passed
        if (customerResult.balance < 0)
            throw new GraphQLYogaError(
                "Not enough money to complete purchase",
                { code: "BALANCE_TOO_LOW" }
            );

        await trx("bankAccounts")
            .increment("balance", totalPrice)
            .where("id", companyId);

        await trx("purchaseTransactions").insert({
            date,
            customerUserSignature: stringifyUserSignature(customer),
            companyId,
            grossPrice: totalPrice,
            netPrice: totalPrice,
            discount,
        });
        const rawPurchase = (await trx("purchaseTransactions")
            .select("*")
            .where("id", knex.raw("last_insert_rowid()"))
            .first()) as IPurchaseTransaction;

        await trx("productSales").insert(
            prices.map(({ productId, amount, price }) => ({
                purchaseId: rawPurchase.id,
                productId,
                amount,
                grossRevenue: amount * price,
            }))
        );

        return {
            type: "PURCHASE",
            ...rawPurchase,
            customerUserSignature: parseUserSignature(
                rawPurchase.customerUserSignature
            ),
        };
    });
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
