import { test, beforeEach, afterEach } from "@jest/globals";
import { assert } from "chai";
import {
    assertNoErrors,
    assertSingleValue,
    buildHTTPUserExecutor,
    buildHTTPAnonymousExecutor,
    type TUserExecutor,
    assertInvalid,
    createTestServer,
    config,
} from "Util/test";

import { type ResultOf } from "@graphql-typed-document-node/core";
import { type TYogaServerInstance } from "Server";
import { type Knex } from "Database";
import { IUserSignature } from "Types/models";
import { graphql } from "./graphql";

graphql(/* GraphQL */ `
    fragment UserSignatureAlt_UserFragment on User {
        type
        id
    }
`);
const certFragment = graphql(/* GraphQL */ `
    fragment All_CertificateFragment on Certificate {
        id
        issuer {
            ...UserSignatureAlt_UserFragment
        }
    }
`);
type Cert = ResultOf<typeof certFragment>;

let knex: Knex;
let yoga: TYogaServerInstance;
let anonymous: TYogaExecutor;
let company: TUserExecutor;
let borderControl: TUserExecutor;
let admin: TUserExecutor;
beforeEach(async () => {
    [knex, yoga] = await createTestServer();

    anonymous = buildHTTPAnonymousExecutor(yoga);
    company = await buildHTTPUserExecutor(knex, yoga, { type: "COMPANY" });
    borderControl = await buildHTTPUserExecutor(knex, yoga, {
        type: "COMPANY",
        id: config.roles.borderControlCompanyId,
    });
    admin = await buildHTTPUserExecutor(knex, yoga, {
        type: "CITIZEN",
        id: config.roles.adminCitizenIds[0],
    });
});
afterEach(async () => {
    await knex.destroy();
});

async function testCreateCerts(number: number) {
    // invalid requests
    const noUser = await anonymous();
}
