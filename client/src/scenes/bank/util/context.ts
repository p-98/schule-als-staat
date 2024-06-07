import React from "react";
import { FragmentType, makeFragmentData } from "Utility/graphql";
import { UserBanner_UserFragment } from "Components/userBanner/userBanner";

export const fragmentData = makeFragmentData(
    {
        __typename: "CitizenUser",
    },
    UserBanner_UserFragment
);

export const BankUserContext =
    React.createContext<FragmentType<typeof UserBanner_UserFragment>>(
        fragmentData
    );
BankUserContext.displayName = "BankUserContext";
