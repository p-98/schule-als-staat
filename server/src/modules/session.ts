import { GraphQLYogaError } from "@graphql-yoga/node";
import type { TUserSignature } from "Types";
import type { TResolvers } from "Types/schema";
import { knex } from "Database";

async function login(
    id: string,
    user: TUserSignature,
    password: string
): Promise<void> {
    // TODO: check password

    const success = await knex("sessions")
        .update({ user: JSON.stringify(user) })
        .where({ id });
    if (!success) throw new GraphQLYogaError("Invalid session id");
}

async function logout(id: string): Promise<void> {
    const success = await knex("sessions").update({ user: null }).where({ id });
    if (!success) throw new GraphQLYogaError("Invalid session id");
}

export default {
    Query: {
        session: (_, __, context) => context.session,
    },
    Mutation: {
        login: async (_, args, context) => {
            await login(context.session.id, args.user, args.password);
            // eslint-disable-next-line no-param-reassign
            context.session.user = args.user;
            return context.session;
        },
        logout: async (_, __, context) => {
            await logout(context.session.id);
            // eslint-disable-next-line no-param-reassign
            context.session.user = null;
            return context.session;
        },
    },
} as TResolvers;
