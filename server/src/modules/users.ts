import type {
    ICitizenUserModel,
    ICompanyUserModel,
    IGuestUserModel,
    IUserSignature,
    TUserModel,
} from "Types/models";
import { getGuest } from "Modules/foreignOffice";
import { getCitizen } from "Modules/registryOffice";
import { getCompany } from "Modules/tradeRegistry";

// maps the UserType enum to the object type names
export enum EUserTypes {
    GUEST = "GuestUser",
    CITIZEN = "CitizenUser",
    COMPANY = "CompanyUser",
}

export async function getUser(
    user: IUserSignature & { type: "GUEST" }
): Promise<IGuestUserModel>;
export async function getUser(
    user: IUserSignature & { type: "CITIZEN" }
): Promise<ICitizenUserModel>;
export async function getUser(
    user: IUserSignature & { type: "COMPANY" }
): Promise<ICompanyUserModel>;
export async function getUser(user: IUserSignature): Promise<TUserModel>;
export async function getUser(user: IUserSignature): Promise<TUserModel> {
    // eslint-disable-next-line default-case
    switch (user.type) {
        case "GUEST":
            return getGuest(user.id);
        case "CITIZEN":
            return getCitizen(user.id);
        case "COMPANY":
            return getCompany(user.id);
    }
}
