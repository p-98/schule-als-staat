import type { TEvents, YogaServerContext } from "Types/models";
import {
    createPubSub,
    createServer,
    YogaInitialContext,
} from "@graphql-yoga/node";
import libraryResolvers from "Modules/library";
import sessionResolvers from "Modules/session";
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

const server = createServer({
    schema: {
        typeDefs,
        resolvers: [libraryResolvers, sessionResolvers],
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
