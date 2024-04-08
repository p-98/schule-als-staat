import type {
    ICitizenUserModel,
    ICompanyUserModel,
    IGuestUserModel,
    IUserSignature,
    TUserModel,
} from "Types/models";
import type { TUserRole } from "Types/schema";
import type { IAppContext } from "Server";

import { getGuest } from "Modules/foreignOffice";
import { getCitizen } from "Modules/registryOffice";
import { getCompany } from "Modules/tradeRegistry";
import { checkRole } from "Util/auth";

export async function getUser(
    ctx: IAppContext,
    user: IUserSignature & { type: "GUEST" }
): Promise<IGuestUserModel>;
export async function getUser(
    ctx: IAppContext,
    user: IUserSignature & { type: "CITIZEN" }
): Promise<ICitizenUserModel>;
export async function getUser(
    ctx: IAppContext,
    user: IUserSignature & { type: "COMPANY" }
): Promise<ICompanyUserModel>;
export async function getUser(
    ctx: IAppContext,
    user: IUserSignature
): Promise<TUserModel>;
export async function getUser(
    ctx: IAppContext,
    user: IUserSignature
): Promise<TUserModel> {
    // eslint-disable-next-line default-case
    switch (user.type) {
        case "GUEST":
            return getGuest(ctx, user.id);
        case "CITIZEN":
            return getCitizen(ctx, user.id);
        case "COMPANY":
            return getCompany(ctx, user.id);
    }
}

const roles: TUserRole[] = [
    "ADMIN",
    "BANK",
    "BORDER_CONTROL",
    "CITIZEN",
    "COMPANY",
    "GUEST",
    "POLICE",
    "POLITICS",
    "USER",
];
/** Get roles of user
 *
 * @preconition: user exists
 */
export async function getRoles(
    ctx: IAppContext,
    user: IUserSignature
): Promise<TUserRole[]> {
    return roles.reduce<TUserRole[]>((acc, role) => {
        if (checkRole(user, role)) acc.push(role);
        return acc;
    }, []);
}
