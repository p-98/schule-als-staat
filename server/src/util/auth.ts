import type { TNullable } from "Types";
import type { IUserSignature, TUserModel } from "Types/models";
import type { TAuthRole, TCredentialsInput } from "Types/schema";

import bcrypt from "bcrypt";
import { isNil } from "lodash/fp";
import { assert, GraphQLYogaError } from "Util/error";
import { getUser } from "Modules/users";
import config from "Config";
import { IAppContext } from "Server";

export async function assertCredentials(
    ctx: IAppContext,
    credentials: TCredentialsInput
): Promise<void> {
    // implicitly checks that user exists
    const user = await getUser(ctx, credentials);
    if (user.type === "GUEST") {
        assert(
            isNil(credentials.password),
            "Must not specify password for guest",
            "BAD_USER_INPUT"
        );
        return;
    }

    assert(
        !isNil(credentials.password),
        `Must specify password for ${user.type.toLowerCase()}`,
        "BAD_USER_INPUT"
    );
    assert(
        await bcrypt.compare(credentials.password, user.password),
        "Invalid password",
        "PERMISSION_DENIED"
    );
}

// function for checking privileges
// TOOD: implement full functionality
type TUserLike = TNullable<IUserSignature | TUserModel>;
export function checkRole(
    user: TUserLike,
    role: "CITIZEN"
): user is TUserLike & { type: "CITIZEN" };
export function checkRole(
    user: TUserLike,
    role: "COMPANY"
): user is TUserLike & { type: "COMPANY" };
export function checkRole(
    user: TUserLike,
    role: "BANK"
): user is TUserLike & { type: "COMPANY" };
export function checkRole(user: TUserLike, role: TAuthRole): boolean;
export function checkRole(user: TUserLike, role: TAuthRole): boolean {
    if (user === null) return false;

    switch (role) {
        case "USER":
            return user !== null;

        case "GUEST":
        case "CITIZEN":
        case "COMPANY":
            return user.type === role;

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

        default:
            throw new Error("Role check not yet implemented");
    }
}

export function assertRole(
    user: TUserLike,
    role: "USER"
): asserts user is TUserLike & { type: "GUEST" | "CITIZEN" | "COMPANY" };
export function assertRole(
    user: TUserLike,
    role: "GUEST"
): asserts user is TUserLike & { type: "GUEST" };
export function assertRole(
    user: TUserLike,
    role: "CITIZEN"
): asserts user is TUserLike & { type: "CITIZEN" };
export function assertRole(
    user: TUserLike,
    role: "COMPANY"
): asserts user is TUserLike & { type: "COMPANY" };
export function assertRole(user: TUserLike, role: TAuthRole): void;
export function assertRole(user: TUserLike, role: TAuthRole): void {
    if (checkRole(user, role)) return;

    let message: string;
    switch (role) {
        case "USER":
            message = "Not logged in";
            break;
        case "GUEST":
            message = "Not logged in as guest";
            break;
        case "CITIZEN":
            message = "Not logged in as citizen";
            break;
        case "COMPANY":
            message = "Not logged in as company";
            break;
        case "BANK":
            message = "Not logged in as bank";
            break;
        case "BORDER_CONTROL":
            message = "Not logged in as border control";
            break;
        default:
            throw new Error("Role assertion check not yet implemented");
    }

    throw new GraphQLYogaError(message, { code: "PERMISSION_DENIED" });
}
