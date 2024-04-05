import React from "react";
import { AuthUser_UserFragment } from "Components/login/authUser";
import { FragmentType, makeFragmentData } from "Utility/graphql";

export const fragmentData = makeFragmentData(
    {
        __typename: "CitizenUser",
        type: "CITIZEN",
        id: "someId",
    },
    AuthUser_UserFragment
);

export const BankUserContext =
    React.createContext<FragmentType<typeof AuthUser_UserFragment>>(
        fragmentData
    );
BankUserContext.displayName = "BankUserContext";
