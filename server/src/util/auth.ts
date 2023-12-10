import type { TNullable } from "Types";
import type { IUserSignature, TUserModel } from "Types/models";
import type { TAuthRole, TCredentialsInput } from "Types/schema";

import bcrypt from "bcrypt";
import { isNil } from "lodash/fp";
import { assert } from "Util/error";
import { getUser } from "Modules/users";
import config from "Config";
import { IAppContext } from "Server";

export async function assertCredentials(
    ctx: IAppContext,
    credentials: TCredentialsInput
): Promise<TUserModel> {
    // implicitly checks that user exists
    const user = await getUser(ctx, credentials);
    if (user.type === "GUEST") {
        assert(
            isNil(credentials.password),
            "Must not specify password for guest",
            "BAD_USER_INPUT"
        );
        return user;
    }

    assert(
        !isNil(credentials.password),
        `Must specify password for ${user.type.toLowerCase()}`,
        "BAD_USER_INPUT"
    );
    assert(
        await bcrypt.compare(credentials.password, user.password),
        "Wrong password",
        "WRONG_PASSWORD"
    );
    return user;
}

// function for checking privileges
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "ADMIN"
): user is IUserSignature & { type: "CITIZEN" };
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "USER"
): user is IUserSignature;
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "CITIZEN"
): user is IUserSignature & { type: "CITIZEN" };
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "COMPANY"
): user is IUserSignature & { type: "COMPANY" };
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "GUEST"
): user is IUserSignature & { type: "GUEST" };
export function checkRole(
    user: TNullable<IUserSignature>,
    role: "POLICE" | "BANK" | "BORDER_CONTROL" | "POLITICS"
): user is IUserSignature & { type: "COMPANY" };
export function checkRole(
    user: TNullable<IUserSignature>,
    role: TAuthRole
): boolean;
export function checkRole(
    user: TNullable<IUserSignature>,
    role: TAuthRole
): boolean {
    if (user === null) return false;

    switch (role) {
        case "ADMIN":
            return (
                user.type === "CITIZEN" &&
                config.server.adminCitizenIds.includes(user.id)
            );
        case "USER":
            return user !== null;
        case "GUEST":
        case "CITIZEN":
        case "COMPANY":
            return user.type === role;
        case "POLICE":
            return (
                user.type === "COMPANY" &&
                user.id === config.server.policeCompanyId
            );
        case "BANK":
            return (
                user.type === "COMPANY" &&
                user.id === config.server.bankCompanyId
            );
        case "BORDER_CONTROL":
            return (
                user.type === "COMPANY" &&
                user.id === config.server.borderControlCompanyId
            );
        case "POLITICS":
            return (
                user.type === "COMPANY" &&
                user.id === config.server.policiticsCompanyId
            );
    }
}

const assertRoleMessages = {
    ADMIN: "Not logged in as admin",
    BANK: "Not logged in as bank",
    BORDER_CONTROL: "Not logged in as border control",
    CITIZEN: "Not logged in as citizen",
    COMPANY: "Not logged in as company",
    GUEST: "Not logged in as guest",
    POLICE: "Not logged in as police",
    POLITICS: "Not logged in as political admin",
    USER: "Not logged in",
};
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "ADMIN",
    message?: string,
    code?: string
): asserts user is IUserSignature & { type: "CITIZEN" };
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "USER",
    message?: string,
    code?: string
): asserts user is IUserSignature;
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "CITIZEN",
    message?: string,
    code?: string
): asserts user is IUserSignature & { type: "CITIZEN" };
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "COMPANY",
    message?: string,
    code?: string
): asserts user is IUserSignature & { type: "COMPANY" };
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "GUEST",
    message?: string,
    code?: string
): asserts user is IUserSignature & { type: "GUEST" };
export function assertRole(
    user: TNullable<IUserSignature>,
    role: "POLICE" | "BANK" | "BORDER_CONTROL" | "POLITICS",
    message?: string,
    code?: string
): asserts user is IUserSignature & { type: "COMPANY" };
export function assertRole(
    user: TNullable<IUserSignature>,
    role: TAuthRole,
    message?: string,
    code?: string
): void {
    assert(
        checkRole(user, role),
        message ?? assertRoleMessages[role],
        code ?? "PERMISSION_DENIED"
    );
}
