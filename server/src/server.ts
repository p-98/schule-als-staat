/* eslint-disable react-hooks/rules-of-hooks */
import type { YogaInitialContext, YogaServerInstance } from "graphql-yoga";
import { Db, Knex } from "Database";
import type { TEvents } from "Types/models";
import { WithCookieStore, UnPromise } from "Util/misc";

import { createPubSub, createSchema, createYoga } from "graphql-yoga";
import { useCookies } from "@whatwg-node/server-plugin-cookies";
import {
    VoidTypeDefinition,
    DateTimeTypeDefinition,
    JSONDefinition,
} from "graphql-scalars";
import { type Config } from "Root/types/config";

import * as typeDefs from "Root/schema.graphql";
import sessionFactory from "./sessionFactory";
import { resolvers } from "./resolvers";

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
        plugins: [useCookies()],
    });
