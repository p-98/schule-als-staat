import type { TEvents, YogaServerContext, TPayload } from "Types/models";
import { TResolvers } from "Types/schema";
import {
    createPubSub,
    createServer,
    YogaInitialContext,
    GraphQLYogaError,
    pipe,
    filter,
} from "@graphql-yoga/node";
import {
    VoidTypeDefinition,
    VoidResolver,
    DateTimeTypeDefinition,
    DateTimeResolver,
} from "graphql-scalars";
import { formatRFC3339, subDays } from "date-fns";

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
import config from "Config";

import * as typeDefs from "./schema.graphql";
import sessionFactory from "./sessionFactory";

const pubsub = createPubSub<TEvents>();

const createContext = async ({
    req,
    res,
}: YogaInitialContext & YogaServerContext) => ({
    session: await sessionFactory(req, res),
    pubsub,
});
export type TCreateContext = typeof createContext;

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
        user: (parent) => {
            if (!parent.userSignature) return null;

            if (!parent.$user) parent.$user = getUser(parent.userSignature);
            return parent.$user;
        },
    },
    /* eslint-enable no-param-reassign */

    User: {
        __resolveType: (parent) => EUserTypes[parent.type],
        transactions: (parent) => getTransactionsByUser(parent),
    },
    CitizenUser: {
        employment: async (parent) => (await getEmployments(parent))[0],
    },
    CompanyUser: {
        products: (parent) => getProducts(parent.id),
        employer: (parent) => getEmployer(parent.id),
        employees: (parent) => getEmployments(parent),
        stats: (parent) => getCompanyStats(parent.id),
    },

    Worktime: {
        employment: (parent) => getEmployment(parent.employmentId),
    },

    Employment: {
        company: (parent) => getCompany(parent.companyId),
        employee: (parent) => getCitizen(parent.citizenId),
        worktimeToday: (parent) =>
            getWorktimeForDay(parent.id, formatRFC3339(new Date())),
        worktimeYesterday: (parent) =>
            getWorktimeForDay(parent.id, formatRFC3339(subDays(new Date(), 1))),
    },
    EmploymentOffer: {
        company: (parent) => getCompany(parent.companyId),
        employee: (parent) => getCitizen(parent.citizenId),
    },

    TransferTransaction: {
        sender: (parent) => getUser(parent.senderUserSignature),
        receiver: (parent) => getUser(parent.receiverUserSignature),
    },
    ChangeTransaction: {
        user: (parent) => getUser(parent.userSignature),
    },
    PurchaseItem: {
        product: (parent) => getProduct(parent.productId),
    },
    PurchaseTransaction: {
        customer: (parent) => getUser(parent.customerUserSignature),
        company: (parent) => getCompany(parent.companyId),
        tax: (parent) => parent.grossPrice - parent.netPrice,
        items: (parent) => getPurchaseItems(parent.id),
    },
    CustomsTransaction: {
        user: (parent) => getUser(parent.userSignature),
    },
    SalaryTransaction: {
        employment: (parent) => getEmployment(parent.employmentId),
        worktime: (parent) => {
            if (parent.worktimeId === null) return null;
            return getWorktime(parent.worktimeId);
        },
        isBonus: (parent) => parent.worktimeId === null,
    },

    BorderCrossing: {
        citizen: (parent) => getCitizen(parent.citizenId),
    },

    Product: {
        company: (parent) => getCompany(parent.companyId),
        salesToday: (parent) => getSalesToday(parent.id),
        salesTotal: (parent) => getSalesTotal(parent.id),
        salesPerDay: (parent) => getSalesPerDay(parent.id),
        grossRevenueTotal: (parent) => getGrossRevenueTotal(parent.id),
        stats: (parent) => getProductStats(parent.id),
    },

    VoteCitizenEdge: {
        user: (parent) => getCitizen(parent.citizenId),
    },

    Vote: {
        votes: (parent) => getVotes(parent.id),
    },

    Query: {
        books: () => getAllBooks(),
        book: (_, args) => getBook(args.title),
        authors: () => getAllAuthors(),
        author: (_, args) => getAuthor(args.name),

        /* eslint-disable no-param-reassign */
        session: (_, __, context) => context.session,
        me: (_, __, context) => {
            if (!context.session.userSignature)
                throw new GraphQLYogaError("Not logged in", {
                    code: "NOT_LOGGED_IN",
                });

            if (!context.session.$user)
                context.session.$user = getUser(context.session.userSignature);

            return context.session.$user;
        },
        /* eslint-enable no-param-reassign */

        votes: () => getAllVotes(),
    },
    Mutation: {
        addBook: (_, args, context) => {
            const newBook = addBook(args.input);
            context.pubsub.publish("ADDED_BOOK", newBook);
            return newBook;
        },

        /* eslint-disable no-param-reassign */
        login: async (_, args, context) => {
            const userModel = await login(
                context.session.id,
                args.user,
                args.password ?? null
            );
            context.session.userSignature = args.user;
            return userModel;
        },
        logout: async (_, __, context) => {
            await logout(context.session.id);
            context.session.userSignature = null;
        },
        /* eslint-enable no-param-reassign */

        createEmploymentOffer: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return createEmploymentOffer(
                context.session.userSignature.id,
                args.offer
            );
        },
        acceptEmploymentOffer: async (_, args, context) => {
            assertRole(context.session.userSignature, "CITIZEN");

            return acceptEmploymentOffer(
                context.session.userSignature.id,
                safeParseInt(args.id, 10)
            );
        },
        rejectEmploymentOffer: async (_, args, context) => {
            assertRole(context.session.userSignature, "CITIZEN");

            return rejectEmploymentOffer(
                context.session.userSignature.id,
                safeParseInt(args.id, 10),
                args.reason ?? null
            );
        },
        deleteEmploymentOffer: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return deleteEmploymentOffer(
                context.session.userSignature.id,
                safeParseInt(args.id, 10)
            );
        },
        cancelEmployment: async (_, args, context) => {
            if (
                !(
                    checkRole(context.session.userSignature, "COMPANY") ||
                    checkRole(context.session.userSignature, "CITIZEN")
                )
            )
                throw new GraphQLYogaError(
                    "Not logged in as Citizen or Company",
                    { code: "PERMISSION_DENIED" }
                );

            return cancelEmployment(
                context.session.userSignature,
                safeParseInt(args.id, 10)
            );
        },

        payBonus: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return payBonus(
                context.session.userSignature.id,
                args.value,
                args.employmentIds.map((employmentId) =>
                    safeParseInt(employmentId, 10)
                )
            );
        },
        changeCurrencies: async (_, args, context) => {
            assertRole(context.session.userSignature, "BANK");

            return changeCurrencies(args.change, args.password);
        },
        transferMoney: async (_, args, context) => {
            assertRole(context.session.userSignature, "CITIZEN");
            if (!checkRole(args.transfer.receiver, "CITIZEN"))
                throw new GraphQLYogaError(
                    "Money can only be tranfered to citizens.",
                    { code: "FORBIDDEN_TRANSFER_TARGET" }
                );

            return transferMoney(
                context.session.userSignature,
                args.transfer.receiver,
                args.transfer.value,
                args.transfer.purpose ?? null
            );
        },
        sell: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");
            if (!checkRole(args.purchase.customer, "CITIZEN"))
                throw new GraphQLYogaError(
                    "Only citizens are allowed to make a purchase.",
                    { code: "FORBIDDEN_PURCHASE_CUSTOMER" }
                );

            const customer = await getUser(args.purchase.customer);
            if (!(await checkPassword(customer, args.password)))
                throw new GraphQLYogaError("Invalid password of customer", {
                    code: "INVALID_PASSWORD",
                });

            return sell(
                context.session.userSignature.id,
                customer,
                args.purchase.items,
                args.purchase.discount ?? null
            );
        },
        warehousePurchase: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return sell(
                config.server.warehouseCompanyId,
                await getUser(context.session.userSignature),
                args.purchase.items,
                null
            );
        },
        chargeCustoms: async (_, args, context) => {
            assertRole(context.session.userSignature, "BORDER_CONTROL");

            return chargeCustoms(args.customs.user, args.customs.value);
        },

        registerBorderCrossing: async (_, args, context) => {
            assertRole(context.session.userSignature, "BORDER_CONTROL");

            return registerBorderCrossing(args.citizenId);
        },

        createGuest: async (_, args, context) => {
            assertRole(context.session.userSignature, "BORDER_CONTROL");

            return createGuest(args.guest.name ?? null, args.guest.cardId);
        },
        removeGuest: async (_, args, context) => {
            assertRole(context.session.userSignature, "BORDER_CONTROL");

            return removeGuest(args.cardId);
        },

        addProduct: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return addProduct(
                context.session.userSignature.id,
                args.product.name,
                args.product.price
            );
        },
        editProduct: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return editProduct(
                context.session.userSignature.id,
                args.product.id,
                args.product.name ?? null,
                args.product.price ?? null
            );
        },
        removeProduct: async (_, args, context) => {
            assertRole(context.session.userSignature, "COMPANY");

            return removeProduct(
                context.session.userSignature.id,
                args.productId
            );
        },

        createVote: async (_, args, context) => {
            assertRole(context.session.userSignature, "POLITICS");

            return createVote(
                args.vote.type,
                args.vote.title,
                args.vote.description,
                await fileToBase64(args.vote.image),
                args.vote.endAt,
                args.vote.choices
            );
        },
        vote: async (_, args, context) => {
            assertRole(context.session.userSignature, "CITIZEN");

            return vote(
                context.session.userSignature.id,
                args.vote.voteId,
                args.vote.vote
            );
        },
    },
    Subscription: {
        addedBook: {
            subscribe: (_, args, context) =>
                pipe(
                    context.pubsub.subscribe("ADDED_BOOK"),
                    filter((book) =>
                        args.author ? args.author === book.author : true
                    )
                ),
            resolve: (payload: TPayload<"ADDED_BOOK">) => payload,
        },
    },
};

const server = createServer({
    schema: {
        typeDefs: [typeDefs, VoidTypeDefinition, DateTimeTypeDefinition],
        resolvers,
    },
    context: createContext,
});
server.start().catch((e) => {
    throw e;
});

// HMR
if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        server.stop();
    });
}
