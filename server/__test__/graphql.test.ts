import { createSchema, createYoga } from "graphql-yoga";
import { test, expect } from "bun:test";
import { parse } from "graphql";
import { buildHTTPExecutor } from "@graphql-tools/executor-http";
import { assert, AssertionError } from "chai";
// import { buildHTTPCookieExecutor, buildHTTPExecutor } from "./util";

const yoga = createYoga({
    schema: createSchema({
        typeDefs: /* GraphQL */ `
            type Query {
                greetings: String!
            }
        `,
        resolvers: {
            Query: {
                greetings: () => "Hello World!",
            },
        },
    }),
});

const executor = buildHTTPExecutor({
    fetch: yoga.fetch,
    endpoint: "http://test.url/graphql",
});

test("yoga works", async () => {
    const result = await executor({
        document: parse(/* GraphQL */ `
            query {
                greetings
            }
        `),
    });
    expect(result).toEqual({
        data: {
            greetings: "Hello World!",
        },
    });
});

test("chai works", async () => {
    throw new Error("test error");
    expect([1, 2]).toEqual([1, 3]);
    throw new AssertionError("why?");
    assert.deepEqual([1, 2], [1, 3]);
});
