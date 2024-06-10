/* eslint-disable react-hooks/rules-of-hooks */
import type { YogaInitialContext, YogaServerInstance } from "graphql-yoga";
import type { Db, Knex } from "Database";
import type { TEvents } from "Types/models";
import { WithCookieStore, UnPromise, pipe1 } from "Util/misc";

import { entries, mapValues } from "lodash/fp";
import { DocumentNode, parse } from "graphql";
import { createPubSub, createSchema, createYoga } from "graphql-yoga";
import { usePersistedOperations } from "@graphql-yoga/plugin-persisted-operations";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import {
    VoidTypeDefinition,
    DateTimeTypeDefinition,
    JSONDefinition,
} from "graphql-scalars";
import { type Config } from "Root/types/config";

import * as typeDefs from "Root/schema.graphql";
import persistedDocumentsJson from "Util/graphql/persisted-documents.json";
import sessionFactory from "./sessionFactory";
import { resolvers } from "./resolvers";

const persistedDocuments = pipe1(
    persistedDocumentsJson,
    mapValues(parse),
    entries<DocumentNode>,
    (e) => new Map(e)
);

export interface IDynamicConfig {
    get: () => Promise<Config>;
    reload: () => Promise<void>;
}
export type TBackup = () => Promise<void>;

const pubsub = createPubSub<TEvents>();

const createAppContext =
    (db: Db, knex: Knex, config: IDynamicConfig) =>
    async ({ request }: IInitialContext) => ({
        session: await sessionFactory(knex, request),
        knex,
        db,
        // config reload only takes effect for future requests
        config: { ...(await config.get()), reload: () => config.reload() },
        pubsub,
    });
export type IAppContext = UnPromise<
    ReturnType<ReturnType<typeof createAppContext>>
>;
interface IInitialContext extends YogaInitialContext {
    request: WithCookieStore<Request>;
}
export type IContext = IAppContext & IInitialContext;

/** Type of the yoga instance created by factory function */
export type TYogaServerInstance = YogaServerInstance<
    IInitialContext,
    IAppContext
>;

/** Factory function for usage in unit tests */
export const yogaFactory = (
    db: Db,
    knex: Knex,
    config: IDynamicConfig
): TYogaServerInstance =>
    createYoga({
        schema: createSchema({
            typeDefs: [
                typeDefs,
                VoidTypeDefinition,
                DateTimeTypeDefinition,
                JSONDefinition,
            ],
            resolvers,
        }),
        context: createAppContext(db, knex, config),
        plugins: [
            useCookies(),
            usePersistedOperations({
                getPersistedOperation: (hash) =>
                    persistedDocuments.get(hash) ?? null,
                skipDocumentValidation: true,
                allowArbitraryOperations: process.env.NODE_ENV === "test",
            }),
        ],
    });
