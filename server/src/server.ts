/* eslint-disable react-hooks/rules-of-hooks */
import type { YogaInitialContext, YogaServerInstance } from "graphql-yoga";
import type { Knex } from "Database";
import type { TEvents, TPayload } from "Types/models";
import type { TResolvers } from "Types/schema";
import type { WithCookieStore } from "Util/misc";

import {
    createPubSub,
    createSchema,
    createYoga,
    pipe as pipeSub,
    filter,
} from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import {
    VoidTypeDefinition,
    VoidResolver,
    DateTimeTypeDefinition,
    DateTimeResolver,
} from "graphql-scalars";
import { subDays } from "date-fns/fp";
import { pipe } from "lodash/fp";

import {
    getAllBooks,
    getBooksByAuthor,
    getBook,
    getAllAuthors,
    getAuthor,
    addBook,
} from "Modules/library";
import { checkPassword, login, logout } from "Modules/sessions";
import { EUserTypes, getUser } from "Modules/users";
import {
    getTransactionsByUser,
    payBonus,
    changeCurrencies,
    transferMoney,
    sell,
} from "Modules/bank";
import { getCitizen } from "Modules/registryOffice";
import {
    getEmployments,
    getProducts,
    getEmployer,
    getCompany,
    getEmployment,
    getSalesToday,
    getSalesTotal,
    getSalesPerDay,
    getGrossRevenueTotal,
    getProductStats,
    getCompanyStats,
    getProduct,
    getPurchaseItems,
    getWorktime,
    getWorktimeForDay,
    createEmploymentOffer,
    acceptEmploymentOffer,
    rejectEmploymentOffer,
    deleteEmploymentOffer,
    cancelEmployment,
    addProduct,
    editProduct,
    removeProduct,
} from "Modules/tradeRegistry";
import {
    createVote,
    getAllVotes,
    getVotes,
    vote,
} from "Modules/electoralOffice";
import { chargeCustoms, registerBorderCrossing } from "Modules/borderControl";
import { createGuest, removeGuest } from "Modules/foreignOffice";
import { fileToBase64, safeParseInt } from "Util/parse";
import { assertRole, checkRole } from "Util/auth";
import { formatDateZ } from "Util/date";
import { GraphQLYogaError } from "Util/error";
import config from "Config";

import * as typeDefs from "./schema.graphql";
import sessionFactory from "./sessionFactory";

const pubsub = createPubSub<TEvents>();

const createAppContext = (knex: Knex) => async ({
    request,
}: IInitialContext) => ({
    session: await sessionFactory(knex, request),
    knex,
    config,
    pubsub,
});
type UnPromise<P> = P extends Promise<infer T> ? T : never;
export type IAppContext = UnPromise<
    ReturnType<ReturnType<typeof createAppContext>>
>;
interface IInitialContext extends YogaInitialContext {
    request: WithCookieStore<Request>;
}
export type IContext = IAppContext & IInitialContext;

const resolvers: TResolvers = {
    Void: VoidResolver,
    DateTime: DateTimeResolver,

    Book: {
        author: (parent) => {
            const author = getAuthor(parent.author);

            if (!author)
                throw new GraphQLYogaError(
                    `Author '${parent.author}' not found`,
                    { code: "AUTHOR_NOT_FOUND" }
                );

            return author;
        },
    },
    Author: {
        books: (parent) => getBooksByAuthor(parent.name),
    },

    /* eslint-disable no-param-reassign */
    Session: {
        user: (parent, _, ctx) => {
            if (!parent.userSignature) return null;

            if (!parent.$user)
                parent.$user = getUser(ctx, parent.userSignature);
            return parent.$user;
        },
    },
    /* eslint-enable no-param-reassign */

    User: {
        __resolveType: (parent) => EUserTypes[parent.type],
        transactions: (parent, _, ctx) => getTransactionsByUser(ctx, parent),
    },
    CitizenUser: {
        employment: async (parent, _, ctx) =>
            (await getEmployments(ctx, parent))[0],
    },
    CompanyUser: {
        products: (parent, _, ctx) => getProducts(ctx, parent.id),
        employer: (parent, _, ctx) => getEmployer(ctx, parent.id),
        employees: (parent, _, ctx) => getEmployments(ctx, parent),
        stats: (parent, _, ctx) => getCompanyStats(ctx, parent.id),
    },

    Worktime: {
        employment: (parent, _, ctx) => getEmployment(ctx, parent.employmentId),
    },

    Employment: {
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        employee: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
        worktimeToday: (parent, _, ctx) =>
            getWorktimeForDay(ctx, parent.id, formatDateZ(new Date())),
        worktimeYesterday: (parent, _, ctx) =>
            getWorktimeForDay(
                ctx,
                parent.id,
                pipe(subDays(1), formatDateZ)(new Date())
            ),
    },
    EmploymentOffer: {
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        employee: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
    },

    TransferTransaction: {
        sender: (parent, _, ctx) => getUser(ctx, parent.senderUserSignature),
        receiver: (parent, _, ctx) =>
            getUser(ctx, parent.receiverUserSignature),
    },
    ChangeTransaction: {
        user: (parent, _, ctx) => getUser(ctx, parent.userSignature),
    },
    PurchaseItem: {
        product: (parent, _, ctx) => getProduct(ctx, parent.productId),
    },
    PurchaseTransaction: {
        customer: (parent, _, ctx) =>
            getUser(ctx, parent.customerUserSignature),
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        tax: (parent) => parent.grossPrice - parent.netPrice,
        items: (parent, _, ctx) => getPurchaseItems(ctx, parent.id),
    },
    CustomsTransaction: {
        user: (parent, _, ctx) => getUser(ctx, parent.userSignature),
    },
    SalaryTransaction: {
        employment: (parent, _, ctx) => getEmployment(ctx, parent.employmentId),
        worktime: (parent, _, ctx) => {
            if (parent.worktimeId === null) return null;
            return getWorktime(ctx, parent.worktimeId);
        },
        isBonus: (parent) => parent.worktimeId === null,
    },

    BorderCrossing: {
        citizen: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
    },

    Product: {
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        salesToday: (parent, _, ctx) => getSalesToday(ctx, parent.id),
        salesTotal: (parent, _, ctx) => getSalesTotal(ctx, parent.id),
        salesPerDay: (parent, _, ctx) => getSalesPerDay(ctx, parent.id),
        grossRevenueTotal: (parent, _, ctx) =>
            getGrossRevenueTotal(ctx, parent.id),
        stats: (parent, _, ctx) => getProductStats(ctx, parent.id),
    },

    VoteCitizenEdge: {
        user: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
    },

    Vote: {
        votes: (parent, _, ctx) => getVotes(ctx, parent.id),
    },

    Query: {
        books: () => getAllBooks(),
        book: (_, args) => getBook(args.title),
        authors: () => getAllAuthors(),
        author: (_, args) => getAuthor(args.name),

        /* eslint-disable no-param-reassign */
        session: (_, __, ctx) => ctx.session,
        me: (_, __, ctx) => {
            if (!ctx.session.userSignature)
                throw new GraphQLYogaError("Not logged in", {
                    code: "NOT_LOGGED_IN",
                });

            if (!ctx.session.$user)
                ctx.session.$user = getUser(ctx, ctx.session.userSignature);

            return ctx.session.$user;
        },
        /* eslint-enable no-param-reassign */

        votes: (_, __, ctx) => getAllVotes(ctx),
    },
    Mutation: {
        addBook: (_, args, ctx) => {
            const newBook = addBook(args.input);
            ctx.pubsub.publish("ADDED_BOOK", newBook);
            return newBook;
        },

        /* eslint-disable no-param-reassign */
        login: async (_, args, ctx) => {
            const userModel = await login(
                ctx,
                ctx.session.id,
                args.user,
                args.password ?? null
            );
            ctx.session.userSignature = args.user;
            return userModel;
        },
        logout: async (_, __, ctx) => {
            await logout(ctx, ctx.session.id);
            ctx.session.userSignature = null;
        },
        /* eslint-enable no-param-reassign */

        createEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return createEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                args.offer
            );
        },
        acceptEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "CITIZEN");

            return acceptEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                safeParseInt(args.id, 10)
            );
        },
        rejectEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "CITIZEN");

            return rejectEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                safeParseInt(args.id, 10),
                args.reason ?? null
            );
        },
        deleteEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return deleteEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                safeParseInt(args.id, 10)
            );
        },
        cancelEmployment: async (_, args, ctx) => {
            if (
                !(
                    checkRole(ctx.session.userSignature, "COMPANY") ||
                    checkRole(ctx.session.userSignature, "CITIZEN")
                )
            )
                throw new GraphQLYogaError(
                    "Not logged in as Citizen or Company",
                    { code: "PERMISSION_DENIED" }
                );

            return cancelEmployment(
                ctx,
                ctx.session.userSignature,
                safeParseInt(args.id, 10)
            );
        },

        payBonus: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return payBonus(
                ctx,
                ctx.session.userSignature.id,
                args.value,
                args.employmentIds.map((employmentId) =>
                    safeParseInt(employmentId, 10)
                )
            );
        },
        changeCurrencies: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BANK");

            return changeCurrencies(ctx, args.change, args.password);
        },
        transferMoney: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "CITIZEN");
            if (!checkRole(args.transfer.receiver, "CITIZEN"))
                throw new GraphQLYogaError(
                    "Money can only be tranfered to citizens.",
                    { code: "FORBIDDEN_TRANSFER_TARGET" }
                );

            return transferMoney(
                ctx,
                ctx.session.userSignature,
                args.transfer.receiver,
                args.transfer.value,
                args.transfer.purpose ?? null
            );
        },
        sell: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");
            if (!checkRole(args.purchase.customer, "CITIZEN"))
                throw new GraphQLYogaError(
                    "Only citizens are allowed to make a purchase.",
                    { code: "FORBIDDEN_PURCHASE_CUSTOMER" }
                );

            const customer = await getUser(ctx, args.purchase.customer);
            if (!(await checkPassword(customer, args.password)))
                throw new GraphQLYogaError("Invalid password of customer", {
                    code: "INVALID_PASSWORD",
                });

            return sell(
                ctx,
                ctx.session.userSignature.id,
                customer,
                args.purchase.items,
                args.purchase.discount ?? null
            );
        },
        warehousePurchase: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return sell(
                ctx,
                ctx.config.server.warehouseCompanyId,
                await getUser(ctx, ctx.session.userSignature),
                args.purchase.items,
                null
            );
        },
        chargeCustoms: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BORDER_CONTROL");

            return chargeCustoms(ctx, args.customs.user, args.customs.value);
        },

        registerBorderCrossing: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BORDER_CONTROL");

            return registerBorderCrossing(ctx, args.citizenId);
        },

        createGuest: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BORDER_CONTROL");

            return createGuest(ctx, args.guest.name ?? null, args.guest.cardId);
        },
        removeGuest: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BORDER_CONTROL");

            return removeGuest(ctx, args.cardId);
        },

        addProduct: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return addProduct(
                ctx,
                ctx.session.userSignature.id,
                args.product.name,
                args.product.price
            );
        },
        editProduct: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return editProduct(
                ctx,
                ctx.session.userSignature.id,
                args.product.id,
                args.product.name ?? null,
                args.product.price ?? null
            );
        },
        removeProduct: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return removeProduct(
                ctx,
                ctx.session.userSignature.id,
                args.productId
            );
        },

        createVote: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "POLITICS");

            return createVote(
                ctx,
                args.vote.type,
                args.vote.title,
                args.vote.description,
                await fileToBase64(args.vote.image),
                args.vote.endAt,
                args.vote.choices
            );
        },
        vote: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "CITIZEN");

            return vote(
                ctx,
                ctx.session.userSignature.id,
                args.vote.voteId,
                args.vote.vote
            );
        },
    },
    Subscription: {
        addedBook: {
            subscribe: (_, args, ctx) =>
                pipeSub(
                    ctx.pubsub.subscribe("ADDED_BOOK"),
                    filter((book) =>
                        args.author ? args.author === book.author : true
                    )
                ),
            resolve: (payload: TPayload<"ADDED_BOOK">) => payload,
        },
    },
};

/** Factory function for usage in unit tests */
export const yogaFactory = (
    knex: Knex
): YogaServerInstance<IInitialContext, IAppContext> =>
    createYoga({
        schema: createSchema({
            typeDefs: [typeDefs, VoidTypeDefinition, DateTimeTypeDefinition],
            resolvers,
        }),
        context: createAppContext(knex),
        plugins: [useCookies()],
    });
