import type { TNullable } from "Types";
import type { IUserSignature, TUserModel } from "Types/models";
import type { TUserRole, TCredentialsInput } from "Types/schema";
import type { IAppContext } from "Server";

import bcrypt from "bcrypt";
import { isNil } from "lodash/fp";
import { assert } from "Util/error";
import { getUser } from "Modules/users";

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
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "ADMIN",
    opts?: { allowAdmin?: false }
): user is IUserSignature & { type: "CITIZEN" };
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "USER",
    opts?: { allowAdmin?: false }
): user is IUserSignature;
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "CITIZEN",
    opts?: { allowAdmin?: false }
): user is IUserSignature & { type: "CITIZEN" };
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "COMPANY",
    opts?: { allowAdmin?: false }
): user is IUserSignature & { type: "COMPANY" };
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "GUEST",
    opts?: { allowAdmin?: false }
): user is IUserSignature & { type: "GUEST" };
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "POLICE" | "BANK" | "BORDER_CONTROL" | "POLITICS",
    opts?: { allowAdmin?: false }
): user is IUserSignature & { type: "COMPANY" };
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: TUserRole,
    opts?: { allowAdmin?: boolean }
): boolean;
export function checkRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: TUserRole,
    opts?: { allowAdmin?: boolean }
): boolean {
    if (user === null) return false;

    const isAdmin =
        user.type === "CITIZEN" &&
        ctx.config.roles.adminCitizenIds.includes(user.id);
    if (opts?.allowAdmin && isAdmin) return true;

    switch (role) {
        case "ADMIN":
            return isAdmin;
        case "USER":
            return user !== null;
        case "GUEST":
        case "CITIZEN":
        case "COMPANY":
            return user.type === role;
        case "POLICE":
            return (
                user.type === "COMPANY" &&
                user.id === ctx.config.roles.policeCompanyId
            );
        case "BANK":
            return (
                user.type === "COMPANY" &&
                user.id === ctx.config.roles.bankCompanyId
            );
        case "BORDER_CONTROL":
            return (
                user.type === "COMPANY" &&
                user.id === ctx.config.roles.borderControlCompanyId
            );
        case "POLITICS":
            return (
                user.type === "COMPANY" &&
                user.id === ctx.config.roles.policiticsCompanyId
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
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "ADMIN",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature & { type: "CITIZEN" };
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "USER",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature;
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "CITIZEN",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature & { type: "CITIZEN" };
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "COMPANY",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature & { type: "COMPANY" };
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "GUEST",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature & { type: "GUEST" };
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: "POLICE" | "BANK" | "BORDER_CONTROL" | "POLITICS",
    opts?: { message?: string; code?: string; allowAdmin?: false }
): asserts user is IUserSignature & { type: "COMPANY" };
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: TUserRole,
    opts?: { message?: string; code?: string; allowAdmin?: boolean }
): void;
export function assertRole(
    ctx: IAppContext,
    user: TNullable<IUserSignature>,
    role: TUserRole,
    opts?: { message?: string; code?: string; allowAdmin?: boolean }
): void {
    assert(
        checkRole(ctx, user, role, opts),
        opts?.message ?? assertRoleMessages[role],
        opts?.code ?? "PERMISSION_DENIED"
    );
}
