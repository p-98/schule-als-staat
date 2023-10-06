import type {
    ICitizenUserModel,
    ICompanyUserModel,
    IGuestUserModel,
    IUserSignature,
    TUserModel,
} from "Types/models";
import type { IAppContext } from "Server";

import { getGuest } from "Modules/foreignOffice";
import { getCitizen } from "Modules/registryOffice";
import { getCompany } from "Modules/tradeRegistry";

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
