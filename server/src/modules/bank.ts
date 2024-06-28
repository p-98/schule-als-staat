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
    IChangeTransaction,
    IEmployment,
    ISalaryTransaction,
} from "Types/knex";
import type { IAppContext } from "Server";

import { all, assign, isEmpty, isNull, isUndefined, map } from "lodash/fp";
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
import { getUser } from "Modules/users";
import { getCompany } from "Modules/tradeRegistry";
import { getCitizen } from "Modules/registryOffice";

const addType = <T>(type: T) => assign({ type });

async function getTransferTransactions(
    { knex }: IAppContext,
    user: IUserSignature
): Promise<ITransferTransactionModel[]> {
    const signatureString = stringifyUserSignature(user);

    const query = knex("transferTransactions")
        .select("*")
        .where({ senderUserSignature: signatureString })
        .orWhere({ receiverUserSignature: signatureString })
        .orderBy([{ column: "date" }, { column: "id" }]);

    return (await query).map((raw) => ({
        type: "TRANSFER",
        ...raw,
        senderUserSignature: parseUserSignature(raw.senderUserSignature),
        receiverUserSignature: parseUserSignature(raw.receiverUserSignature),
    }));
}

async function getChangeTransactions(
    ctx: IAppContext,
    user: IUserSignature
): Promise<IChangeTransactionModel[]> {
    const { knex } = ctx;
    const signatureString = stringifyUserSignature(user);

    const query = knex("changeTransactions")
        .select("*")
        .whereNotNull("userSignature")
        .andWhere(
            (builder) =>
                !checkRole(ctx, user, "BANK") &&
                // eslint-disable-next-line no-void
                void builder.where({ userSignature: signatureString })
        )
        .orderBy([{ column: "date" }, { column: "id" }]);

    return (await query).map((raw) => ({
        type: "CHANGE",
        ...raw,
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
        // user is customer
        .where({ customerUserSignature: signatureString })
        // user is seller
        .orWhere((builder) => {
            if (user.type === "COMPANY") {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                builder.whereNotNull("customerUserSignature");
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                builder.andWhere({ companyId: user.id });
            }
        })
        .orderBy([{ column: "date" }, { column: "id" }]);

    return (await query).map((raw) => ({
        type: "PURCHASE",
        ...raw,
        customerUserSignature: parseUserSignature(raw.customerUserSignature!),
    }));
}

async function getCustomsTransactions(
    ctx: IAppContext,
    user: IUserSignature
): Promise<ICustomsTransactionModel[]> {
    const { knex } = ctx;
    const signatureString = stringifyUserSignature(user);

    const query = knex("customsTransactions")
        .where((builder) => {
            if (!checkRole(ctx, user, "BORDER_CONTROL")) {
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                builder.where({ userSignature: signatureString });
            }
        })
        .orderBy([{ column: "date" }, { column: "id" }]);

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
        .select("salaryTransactions.*")
        .orderBy([{ column: "date" }, { column: "id" }]) as Promise<
        ISalaryTransaction[]
    >;

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
    ctx: IAppContext,
    companyId: string
): Promise<IChangeDraftModel[]> {
    const { knex } = ctx;
    const user: IUserSignature = { type: "COMPANY", id: companyId };

    if (!checkRole(ctx, user, "BANK")) return [];

    const result = await knex("changeTransactions")
        .select("*")
        .whereNull("userSignature")
        .orderBy([{ column: "date" }, { column: "id" }]);

    return result.map((raw) => ({
        type: "CHANGE",
        ...raw,
    }));
}

export async function getPurchaseDrafts(
    { knex }: IAppContext,
    companyId: string
): Promise<IPurchaseDraftModel[]> {
    const result = await knex("purchaseTransactions")
        .select("*")
        .whereNull("customerUserSignature")
        .andWhere({ companyId })
        .orderBy([{ column: "date" }, { column: "id" }]);

    return result.map((raw) => ({
        type: "PURCHASE",
        ...raw,
    }));
}

export async function getDraftsByUser(
    ctx: IAppContext,
    companyId: string
): Promise<TDraftModel[]> {
    const query = Promise.all([
        getChangeDrafts(ctx, companyId),
        getPurchaseDrafts(ctx, companyId),
    ]);

    // sort by ascending date
    return (await query).flat().sort(({ date: date1 }, { date: date2 }) => {
        if (date1 < date2) return -1;
        if (date1 > date2) return 1;
        return 0;
    });
}

export async function payBonus(
    ctx: IAppContext,
    value: number,
    employmentIds: number[]
): Promise<ISalaryTransactionModel[]> {
    const { knex, session } = ctx;
    return knex.transaction(async (trx) => {
        const date = formatDateTimeZ(new Date());

        assert(value > 0, "Value must be positive", "BAD_USER_INPUT");
        // TODO: implement taxes
        const tax = 0;
        const grossValue = value;
        const netValue = value - tax;
        const cost = grossValue * employmentIds.length;

        assertRole(ctx, session.userSignature, "COMPANY");
        const company = session.userSignature;
        const [updatedCompany]: { balance: number }[] = await trx.raw(
            `UPDATE bankAccounts
            SET balance = balance - :cost
            FROM companies
            WHERE bankAccounts.id = companies.bankAccountId
              AND companies.id = :companyId
            RETURNING balance`,
            { cost, companyId: company.id }
        );
        assert(
            updatedCompany!.balance > 0,
            "Not enough money to complete bonus payment",
            "BALANCE_TOO_LOW"
        );

        assert(
            !isEmpty(employmentIds),
            "EmploymentsIds must not be empty",
            "BAD_USER_INPUT"
        );
        const singleton = <T>(item: T): [T] => [item];
        const employments: IEmployment[] = await trx.raw(
            `WITH inputEmployments(id) as (:inputs)
            SELECT employments.*
            FROM inputEmployments
            NATURAL JOIN employments`,
            { inputs: values(trx, employmentIds.map(singleton)) }
        );
        assert(
            employments.length === employmentIds.length,
            "One of the employments is invalid",
            "EMPLOYMENT_NOT_FOUND"
        );
        assert(
            all((_) => _.companyId === company.id, employments),
            "One of the employments is from a different company",
            "PERMISSION_DENIED"
        );
        const employmentsTable = employments.map((_) => [_.citizenId]);
        await trx.raw(
            `WITH employments(citizenId) AS (:employments)
            UPDATE bankAccounts
            SET balance = balance + :netValue
            FROM (
                SELECT citizens.bankAccountId
                FROM employments
                INNER JOIN citizens on employments.citizenId = citizens.id
            ) as citizens
            WHERE bankAccounts.id = citizens.bankAccountId`,
            { employments: values(trx, employmentsTable), netValue }
        );

        const transactions = await trx("salaryTransactions")
            .insert(
                employmentIds.map((employmentId) => ({
                    date,
                    employmentId,
                    grossValue,
                    tax,
                    worktimeId: null,
                }))
            )
            .orderBy([{ column: "date" }, { column: "id" }])
            .returning("*");
        return transactions.map((raw) => ({ type: "SALARY", ...raw }));
    });
}

export async function changeCurrencies(
    ctx: IAppContext,
    { fromCurrency, fromValue, toCurrency, clerk }: TChangeInput
): Promise<IChangeDraftModel> {
    const { knex, config } = ctx;
    const date = formatDateTimeZ(new Date());

    assert(
        fromCurrency in config.currencies,
        "Uknown source currency",
        "FROM_CURRENCY_UNKNOWN"
    );
    assert(fromValue > 0, "Value must be positive", "FROM_VALUE_NOT_POSITIVE");
    assert(
        toCurrency in config.currencies,
        "Uknown target currency",
        "TO_CURRENCY_UNKNOWN"
    );
    assert(
        toCurrency !== fromCurrency,
        "Same source and target currency",
        "TO_CURRENCY_SAME_AS_FROM"
    );
    const toValue =
        config.currencies[fromCurrency]!.conversion[toCurrency]!(fromValue);

    return knex.transaction(async (trx) => {
        // check clerk exists
        await getCitizen({ ...ctx, knex: trx }, clerk, {
            code: "CLERK_UNKNOWN",
        });
        const [raw] = await trx("changeTransactions")
            .insert({
                date,
                fromCurrency,
                fromValue,
                toCurrency,
                toValue,
                clerkCitizenId: clerk,
            })
            .returning("*");
        return addType("CHANGE" as const)(raw!);
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
            if (checkRole(ctx, session.userSignature, "BANK")) {
                assert(
                    !isNull(credentials),
                    "Must specify credentials",
                    "CREDENTIALS_MISSING"
                );
                await assertCredentials({ ...ctx, knex: trx }, credentials);
                return credentials;
            }

            assert(
                isNull(credentials),
                "Must not specify credentials",
                "CREDENTIALS_SET"
            );
            assertRole(ctx, session.userSignature, "USER");
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

        const cost = (t: IChangeTransaction): number => {
            if (t.fromCurrency === config.mainCurrency) return t.fromValue;
            if (t.toCurrency === config.mainCurrency) return -t.toValue;
            return 0;
        };
        await trx.raw(
            `
            UPDATE bankAccounts
            SET balance = balance + :cost
            FROM companies
            WHERE companies.bankAccountId = bankAccounts.id AND companies.id = :bankCompanyId
        `,
            { cost: cost(draft), bankCompanyId: config.roles.bankCompanyId }
        );

        const user = await getUser({ ...ctx, knex: trx }, userSignature);
        const [updatedUser] = await trx("bankAccounts")
            .decrement("balance", cost(draft))
            .where("id", user.bankAccountId)
            .returning("balance");
        assert(
            updatedUser!.balance >= 0,
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
    ctx: IAppContext,
    id: number
): Promise<void> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "BANK");
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
    ctx: IAppContext,
    receiver: IUserSignature,
    value: number,
    purpose: TNullable<string>
): Promise<ITransferTransactionModel> {
    const { knex, session } = ctx;
    const sender = session.userSignature;
    const date = formatDateTimeZ(new Date());

    return knex.transaction(async (trx) => {
        assertRole(ctx, sender, "USER");
        // assertRole(ctx, sender, "CITIZEN", {
        //     message: "Only citizens can send money",
        //     code: "TRANSFER_SENDER_RESTRICTED",
        // });
        // assertRole(ctx, receiver, "CITIZEN", {
        //     message: "Only citizens can receive money",
        //     code: "TRANSFER_RECEIVER_RESTRICTED",
        // });
        if (value <= 0)
            throw new GraphQLYogaError("Value must be greater than 0.", {
                code: "VALUE_NOT_POSITIVE",
            });

        const updatedSenders: { balance: number }[] = await trx("bankAccounts")
            .decrement("balance", value)
            .where(
                "id",
                trx(EUserTypeTableMap[sender.type])
                    .select("bankAccountId")
                    .where("id", sender.id)
            )
            .returning("balance");
        assert(
            updatedSenders[0]!.balance >= 0,
            "Not enough money to complete transfer",
            "BALANCE_TOO_LOW"
        );
        const updatedReceivers = await trx("bankAccounts")
            .increment("balance", value)
            .where(
                "id",
                trx(EUserTypeTableMap[receiver.type])
                    .select("bankAccountId")
                    .where("id", receiver.id)
            );
        assert(
            updatedReceivers === 1,
            `User with signature ${stringifyUserSignature(
                receiver
            )} not found.`,
            "USER_NOT_FOUND"
        );

        const inserted = await trx("transferTransactions")
            .insert({
                date,
                senderUserSignature: stringifyUserSignature(sender),
                receiverUserSignature: stringifyUserSignature(receiver),
                value,
                purpose,
            })
            .returning("*");
        const raw = inserted[0]!;
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
    items: { amount: number; product: { id: string; revision: string } }[],
    discount: TNullable<number>
): Promise<IPurchaseDraftModel> {
    const { knex } = ctx;
    return knex.transaction(async (trx) => {
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

        const itemsTable = map(
            (_) => [_.product.id, _.product.revision, _.amount],
            items
        );
        const products: {
            id: string;
            revision: string;
            companyId: string;
            amount: number;
            price: number;
        }[] = await trx.raw(
            `WITH purchaseProducts(id, revision, amount) AS (:values)
            SELECT purchaseProducts.amount, products.id, products.revision, products.companyId, products.price
            FROM purchaseProducts
            INNER JOIN products ON products.id = purchaseProducts.id AND products.revision = purchaseProducts.revision
            WHERE products.deleted IS FALSE`,
            { values: values(trx, itemsTable) }
        );
        assert(
            products.length === items.length,
            "One of the product doesn't exist",
            "PRODUCT_NOT_FOUND"
        );
        assert(
            all((_) => _.companyId === companyId, products),
            "One of the products has a different owner",
            "PERMISSION_DENIED"
        );

        const totalPrice =
            products.reduce((total, _) => total + _.amount * _.price, 0) -
            (discount ?? 0);
        // TODO: implement taxes
        const tax = 0;

        const inserted = await trx("purchaseTransactions")
            .insert({
                date,
                companyId,
                grossPrice: totalPrice,
                tax,
                discount,
            })
            .returning("*");
        const draft = inserted[0]!;
        await trx("productSales").insert(
            products.map(({ id, revision, amount }) => ({
                purchaseId: draft.id,
                productId: id,
                productRevision: revision,
                amount,
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
                checkRole(ctx, session.userSignature, "COMPANY") &&
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
            assertRole(ctx, session.userSignature, "USER");
            return session.userSignature;
        })();

        const netPrice = draft.grossPrice - draft.tax;
        await trx.raw(
            `UPDATE bankAccounts
            SET balance = balance + :netPrice
            FROM companies
            WHERE companies.bankAccountId = bankAccounts.id AND companies.id = :companyId`,
            { companyId: draft.companyId, netPrice }
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
    ctx: IAppContext,
    id: number
): Promise<void> {
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

        assertRole(ctx, session.userSignature, "COMPANY");
        assert(
            session.userSignature.id === draft.companyId,
            "Not logged in as correct user",
            "PERMISSION_DENIED"
        );

        await trx("productSales").delete().where({ purchaseId: draft.id });
        await trx("purchaseTransactions").delete().where({ id });
    });
}
export async function warehousePurchase(
    ctx: IAppContext,
    items: { product: { id: string; revision: string }; amount: number }[]
): Promise<IPurchaseTransactionModel> {
    const { session, knex, config } = ctx;
    assertRole(ctx, session.userSignature, "COMPANY");

    const draft = await sell(ctx, config.roles.warehouseCompanyId, items, null);
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
        id,
        balance: initBalance,
        redemptionBalance: 0,
    });
    return knex("bankAccounts")
        .select("*")
        .where("id", id)
        .first() as Promise<IBankAccount>;
}
