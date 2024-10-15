import { constant, equals, head, isObject, map, times } from "lodash/fp";
import crypto from "node:crypto";
import { promisify } from "node:util";
import { IAppContext } from "Server";
import { ICertificate } from "Types/knex";

import { IUserSignature, type ICertificateModel } from "Types/models";
import { assertRole } from "Util/auth";
import { assert } from "Util/error-fp";
import { type Fn1, mapValues, pipe } from "Util/misc";
import * as promises from "Util/promises";
import { parseUserSignature, stringifyUserSignature } from "Util/parse";

const randomBytes = promisify(crypto.randomBytes);

const dbToModel: Fn1<ICertificate, ICertificateModel> = mapValues({
    issuerUserSignature: parseUserSignature,
});
const modelToDb: Fn1<ICertificateModel, ICertificate> = mapValues({
    issuerUserSignature: stringifyUserSignature,
});
const issuerEq =
    (issuer: IUserSignature) =>
    (cert: ICertificateModel): boolean =>
        equals(issuer, cert.issuerUserSignature);

export async function createCertificates(
    ctx: IAppContext,
    number: number
): Promise<ICertificateModel[]> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "USER");

    return promises.pipe1(
        number,
        times(async () => ({
            id: await randomBytes(7),
            issuerUserSignature: session.userSignature!,
        })),
        promises.all,
        map(modelToDb),
        (_) => knex("certificates").insert(_).returning("*"),
        map(dbToModel)
    );
}

export async function verifyCertificate(
    ctx: IAppContext,
    id: Buffer
): Promise<ICertificateModel> {
    const { knex } = ctx;

    return promises.pipe1(
        knex("certificates").select("*").where({ id }).first(),
        assert(
            isObject,
            `Certificate with id '${id.toString("hex")}' not found`,
            "ID_UNKNOWN"
        ),
        dbToModel
    );
}

export async function deleteCertificate(
    ctx: IAppContext,
    id: Buffer
): Promise<void> {
    const { knex, session } = ctx;
    assertRole(ctx, session.userSignature, "USER");

    return knex.transaction(async (trx) =>
        promises.pipe1(
            trx("certificates").delete("*").where({ id }),
            head,
            assert(
                isObject,
                `Certificate with id '${id.toString("hex")}' not found`,
                "ID_UNKNOWN"
            ),
            assert(
                // failure leads to rollback
                pipe(dbToModel, issuerEq(session.userSignature!)),
                `Certificate owned by a different user.`,
                "PERMISSION_DENIED"
            ),
            constant(undefined)
        )
    );
}
