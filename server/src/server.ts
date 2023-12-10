/* eslint-disable react-hooks/rules-of-hooks */
import type { YogaInitialContext, YogaServerInstance } from "graphql-yoga";
import type { Knex } from "Database";
import type {
    ICitizenUserModel,
    ICompanyUserModel,
    IGuestUserModel,
    TEvents,
    TPayload,
} from "Types/models";
import type { TResolvers } from "Types/schema";
import type { WithCookieStore, UnPromise } from "Util/misc";

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
import { login, logout } from "Modules/sessions";
import { getUser } from "Modules/users";
import {
    getTransactionsByUser,
    payBonus,
    payChangeDraft,
    changeCurrencies,
    transferMoney,
    sell,
    deleteChangeDraft,
    getDraftsByUser,
    warehousePurchase,
    payPurchaseDraft,
    deletePurchaseDraft,
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
    getEmploymentOffers,
} from "Modules/tradeRegistry";
import {
    castVote,
    createVote,
    deleteVote,
    getAllVotes,
} from "Modules/electoralOffice";
import { chargeCustoms, registerBorderCrossing } from "Modules/borderControl";
import { createGuest, getGuest, removeGuest } from "Modules/foreignOffice";
import { assertRole, checkRole } from "Util/auth";
import { formatDateZ } from "Util/date";
import { GraphQLYogaError } from "Util/error";
import { EUserTypes, ETransactionTypes, EDraftTypes } from "Types/models";
import config from "Config";

import * as typeDefs from "./schema.graphql";
import sessionFactory from "./sessionFactory";

const pubsub = createPubSub<TEvents>();

const createAppContext =
    (knex: Knex) =>
    async ({ request }: IInitialContext) => ({
        session: await sessionFactory(knex, request),
        knex,
        config,
        pubsub,
    });
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
    GuestUser: {
        transactions: (parent, _, ctx) => getTransactionsByUser(ctx, parent),
    },
    CitizenUser: {
        transactions: (parent, _, ctx) => getTransactionsByUser(ctx, parent),
        employment: async (parent, _, ctx) =>
            (await getEmployments(ctx, parent))[0],
        employmentOffers: async (parent, args, ctx) =>
            getEmploymentOffers(ctx, parent, args.state),
    },
    CompanyUser: {
        transactions: (parent, _, ctx) => getTransactionsByUser(ctx, parent),
        drafts: (parent, _, ctx) => getDraftsByUser(ctx, parent.id),
        products: (parent, _, ctx) => getProducts(ctx, parent.id),
        employer: (parent, _, ctx) => getEmployer(ctx, parent.id),
        employees: (parent, _, ctx) => getEmployments(ctx, parent),
        employmentOffers: (parent, args, ctx) =>
            getEmploymentOffers(ctx, parent, args.state),
        stats: (parent, _, ctx) => getCompanyStats(ctx, parent.id),
    },

    Worktime: {
        employment: (parent, _, ctx) => getEmployment(ctx, parent.employmentId),
    },

    Employment: {
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        citizen: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
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
        citizen: (parent, _, ctx) => getCitizen(ctx, parent.citizenId),
    },

    Transaction: {
        __resolveType: (parent) => ETransactionTypes[parent.type],
    },
    Draft: {
        __resolveType: (parent) => EDraftTypes[parent.type],
    },
    TransferTransaction: {
        sender: (parent, _, ctx) => getUser(ctx, parent.senderUserSignature),
        receiver: (parent, _, ctx) =>
            getUser(ctx, parent.receiverUserSignature),
    },
    ChangeTransaction: {
        user: (parent, _, ctx) => getUser(ctx, parent.userSignature),
    },
    ChangeDraft: {},
    PurchaseItem: {
        product: (parent, _, ctx) =>
            getProduct(ctx, parent.productId, parent.productRevision),
    },
    PurchaseTransaction: {
        customer: (parent, _, ctx) =>
            getUser(ctx, parent.customerUserSignature),
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        netPrice: (parent) => parent.grossPrice - parent.tax,
        items: (parent, _, ctx) => getPurchaseItems(ctx, parent.id),
    },
    PurchaseDraft: {
        company: (parent, _, ctx) => getCompany(ctx, parent.companyId),
        netPrice: (parent) => parent.grossPrice - parent.tax,
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
        netValue: (parent) => parent.grossValue - parent.tax,
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

    Vote: {},

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
                    code: "PERMISSION_DENIED",
                });

            if (!ctx.session.$user)
                ctx.session.$user = getUser(ctx, ctx.session.userSignature);

            return ctx.session.$user;
        },
        meGuest: (_, __, ctx) => {
            const { userSignature } = ctx.session;
            assertRole(userSignature, "GUEST");

            if (!ctx.session.$user)
                ctx.session.$user = getGuest(ctx, userSignature.id);

            return ctx.session.$user as Promise<IGuestUserModel>;
        },
        meCitizen: (_, __, ctx) => {
            const { userSignature } = ctx.session;
            assertRole(userSignature, "CITIZEN");

            if (!ctx.session.$user)
                ctx.session.$user = getCitizen(ctx, userSignature.id);

            return ctx.session.$user as Promise<ICitizenUserModel>;
        },
        meCompany: (_, __, ctx) => {
            const { userSignature } = ctx.session;
            assertRole(userSignature, "COMPANY");

            if (!ctx.session.$user)
                ctx.session.$user = getCompany(ctx, userSignature.id);

            return ctx.session.$user as Promise<ICompanyUserModel>;
        },
        /* eslint-enable no-param-reassign */

        votes: (_, __, ctx) => getAllVotes(ctx),
    },
    Mutation: {
        addBook: (_, args, ctx) => {
            const newBook = addBook(args.book);
            ctx.pubsub.publish("ADDED_BOOK", newBook);
            return newBook;
        },

        login: (_, args, ctx) => login(ctx, args.credentials),
        logout: (_, __, ctx) => logout(ctx, ctx.session.id),

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
                args.id
            );
        },
        rejectEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "CITIZEN");

            return rejectEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                args.id,
                args.reason ?? null
            );
        },
        deleteEmploymentOffer: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "COMPANY");

            return deleteEmploymentOffer(
                ctx,
                ctx.session.userSignature.id,
                args.id
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

            return cancelEmployment(ctx, ctx.session.userSignature, args.id);
        },

        payBonus: (_, args, ctx) =>
            payBonus(ctx, args.value, args.employmentIds),
        changeCurrencies: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BANK");

            return changeCurrencies(ctx, args.change);
        },
        payChangeDraft: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "USER");

            return payChangeDraft(ctx, args.credentials ?? null, args.id);
        },
        deleteChangeDraft: async (_, args, ctx) => {
            assertRole(ctx.session.userSignature, "BANK");

            return deleteChangeDraft(ctx, args.id);
        },
        transferMoney: (_, args, ctx) =>
            transferMoney(
                ctx,
                args.transfer.receiver,
                args.transfer.value,
                args.transfer.purpose ?? null
            ),
        sell: (_, args, ctx) => {
            // check role here, so function can be reused for warehouse purchase
            assertRole(ctx.session.userSignature, "COMPANY");
            return sell(
                ctx,
                ctx.session.userSignature.id,
                args.purchase.items,
                args.purchase.discount ?? null
            );
        },
        payPurchaseDraft: (_, args, ctx) =>
            payPurchaseDraft(ctx, args.id, args.credentials ?? null),
        deletePurchaseDraft: (_, args, ctx) =>
            deletePurchaseDraft(ctx, args.id),
        warehousePurchase: (_, args, ctx) =>
            warehousePurchase(ctx, args.purchase.items),
        chargeCustoms: (_, args, ctx) =>
            chargeCustoms(ctx, args.customs.user, args.customs.customs),

        registerBorderCrossing: (_, args, ctx) =>
            registerBorderCrossing(ctx, args.citizenId),

        createGuest: (_, args, ctx) =>
            createGuest(ctx, args.cardId, args.guest),
        removeGuest: (_, args, ctx) => removeGuest(ctx, args.cardId),

        addProduct: (_, args, ctx) => addProduct(ctx, args.product),
        editProduct: (_, args, ctx) => editProduct(ctx, args.id, args.product),
        removeProduct: (_, args, ctx) => removeProduct(ctx, args.id),

        createVote: (_, args, ctx) => createVote(ctx, args.vote),
        deleteVote: (_, args, ctx) => deleteVote(ctx, args.id),
        castVote: (_, args, ctx) => castVote(ctx, args.id, args.votingPaper),
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

/** Type of the yoga instance created by factory function */
export type TYogaServerInstance = YogaServerInstance<
    IInitialContext,
    IAppContext
>;
/** Factory function for usage in unit tests */
export const yogaFactory = (knex: Knex): TYogaServerInstance =>
    createYoga({
        schema: createSchema({
            typeDefs: [typeDefs, VoidTypeDefinition, DateTimeTypeDefinition],
            resolvers,
        }),
        context: createAppContext(knex),
        plugins: [useCookies()],
    });
