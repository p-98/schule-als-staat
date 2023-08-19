import { GraphQLYogaError } from "Util/error";

import { TNullable } from "Types";
import { IUserSignature, TUserModel } from "Types/models";
import { TAuthRole } from "Types/schema";
import config from "Config";

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
export function checkRole(user: TUserLike, role: TAuthRole): boolean;
export function checkRole(user: TUserLike, role: TAuthRole): boolean {
    if (user === null) return false;

    switch (role) {
        case "COMPANY":
        case "CITIZEN":
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
        case "COMPANY":
            message = "Not logged in as company";
            break;
        case "CITIZEN":
            message = "Not logged in as citizen";
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

    throw new GraphQLYogaError(message, { code: "PERMISSION_DENIESD" });
}
