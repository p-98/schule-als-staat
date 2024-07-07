import { useMutation } from "urql";
import { Typography } from "Components/material/typography";
import { ThemePropT } from "Components/material/types";
import { Button } from "Components/material/button";

import { Avatar } from "Components/avatar/avatar";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { useCategorizeError, useSafeData } from "Utility/urql";
import { syncify } from "Utility/misc";
import { name } from "Utility/data";

import css from "./drawerHeader.module.css";

/* Badge component
 */

const badgeStyles = {
    COMPANY: {
        background: "#2962ff",
        theme: "textPrimaryOnDark",
        text: "Unternehmen",
    },
    CITIZEN: {
        background: "#00c853",
        theme: "textPrimaryOnLight",
        text: "Bürger",
    },
    GUEST: {
        background: "#ffab00",
        theme: "textPrimaryOnLight",
        text: "Gast",
    },
    // admin: {
    //     background: "#d50000",
    //     theme: "textPrimaryOnDark",
    //     text: "Administrator",
    // },
};

interface IBadgeProps {
    type: keyof typeof badgeStyles;
}
const Badge: React.FC<IBadgeProps> = ({ type }) => {
    const { background, theme, text } = badgeStyles[type];

    return (
        <Typography
            className={css["badge"]}
            use="caption"
            style={{ background }}
            theme={theme as ThemePropT}
        >
            {text}
        </Typography>
    );
};

/* AccountHeader component
 */

export const DrawerHeader_UserFragment = graphql(/* GraphQL */ `
    fragment DrawerHeader_UserFragment on User {
        ...Avatar_UserFragment
        ...Name_UserFragment
        type
    }
`);
const logoutMutation = graphql(/* GraphQL */ `
    mutation LogoutMutation {
        logout {
            id
            user {
                __typename
                id
            }
        }
    }
`);

interface IDrawerHeaderProps {
    user: FragmentType<typeof DrawerHeader_UserFragment>;
}

export const DrawerHeader: React.FC<IDrawerHeaderProps> = ({ user: _user }) => {
    const user = useFragment(DrawerHeader_UserFragment, _user);
    const [result, logout] = useMutation(logoutMutation);
    const { fetching, error } = useSafeData(result);
    useCategorizeError(error, []);

    return (
        <div className={css["drawer-header"]}>
            <Avatar user={user} className={css["drawer-header__avatar"]} />
            <Typography
                className={css["drawer-header__name"]}
                use="headline6"
                theme="textPrimaryOnLight"
            >
                {name(user)}
            </Typography>
            <Badge type={user.type} />
            <Button
                className={css["drawer-header__logout"]}
                label="Abmelden"
                onClick={() => syncify(logout({}))}
                disabled={fetching}
                outlined
            />
        </div>
    );
};
