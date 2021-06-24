import { ApolloServer, ApolloError, PubSub, withFilter } from "apollo-server";
import type { IResolvers, ISubscriptionAddedBookArgs } from "@type/graphql";
import { ESubscriptionEvents, IBookModel } from "@type/models";
import * as typeDefs from "./schema.graphql";
import contextInit from "./context";

const pubsub = new PubSub();

const resolvers: IResolvers = {
    Book: {
        author: (source, args, context) => {
            const authorObj = context.dataSources.Library.getAuthor(
                source.author
            );

            if (!authorObj)
                throw new ApolloError("Author not found: ", source.author);

            return authorObj;
        },
    },
    Author: {
        books: (source, args, context) =>
            context.dataSources.Library.getBooksByAuthor(source.name),
    },
    Query: {
        books: (source, args, context) =>
            context.dataSources.Library.getAllBooks(),
        book: (source, args, context) =>
            context.dataSources.Library.getBook(args.title),
        authors: (source, args, context) =>
            context.dataSources.Library.getAllAuthors(),
        author: (source, args, context) =>
            context.dataSources.Library.getAuthor(args.name),
    },
    Mutation: {
        addBook: (source, args, context) => {
            const newBook = context.dataSources.Library.addBook(args.input);
            pubsub.publish(ESubscriptionEvents.ADDED_BOOK, newBook); // eslint-disable-line @typescript-eslint/no-floating-promises
            return newBook;
        },
    },
    Subscription: {
        addedBook: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(ESubscriptionEvents.ADDED_BOOK),
                (payload: IBookModel, args: ISubscriptionAddedBookArgs) =>
                    payload.author === args.input.author
            ),
            resolve: (source) => source,
        },
    },
};

// server definition
function startServer() {
    const server = new ApolloServer({
        typeDefs,
        // neccessaary because Apollo supports default resolvers not reflected by graphql type
        resolvers,
        context: contextInit,
        subscriptions: {
            path: "/graphql",
        },
    });
    server
        .listen()
        .then(({ url }) => {
            console.log(`Apollo server running at ${url}`); // eslint-disable-line no-console
        })
        .catch((reason) => {
            console.error("Server unable to start", reason); // eslint-disable-line no-console
        });

    return server;
}

// HMR
/* eslint-disable no-param-reassign, @typescript-eslint/no-unsafe-member-access */
if (module.hot) {
    module.hot.accept();
    if (!module.hot.data) {
        const server = startServer();
        module.hot.dispose((data) => {
            data.server = server;
        });
    } else {
        const { server } = module.hot.data as { server: ApolloServer };

        // is set to false on module dispose because the server should then be started from the new module instance
        let shouldStartServerInstance = true;
        module.hot.dispose(() => {
            shouldStartServerInstance = false;
        });

        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        server.stop().then(() => {
            if (!shouldStartServerInstance) return;

            const newServerInstance = startServer();
            module.hot?.dispose((data) => {
                data.server = newServerInstance;
            });
        });
    }
} else {
    startServer();
}
/* eslint-enable no-param-reassign, @typescript-eslint/no-unsafe-member-access */
