import { Typography } from "Components/material/typography";
import { ThemePropT } from "Components/material/types";

import { Avatar } from "Components/avatar/avatar";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { name } from "Utility/data";

import styles from "./drawerHeader.module.css";

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
            className={styles["badge"]}
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

const DrawerHeader_UserFragment = graphql(/* GraphQL */ `
    fragment DrawerHeader_UserFragment on User {
        ...Avatar_UserFragment
        ...Name_UserFragment
        type
    }
`);

interface IDrawerHeaderProps {
    user: FragmentType<typeof DrawerHeader_UserFragment>;
}

export const DrawerHeader: React.FC<IDrawerHeaderProps> = ({ user: _user }) => {
    const user = useFragment(DrawerHeader_UserFragment, _user);
    return (
        <div className={styles["drawer-header"]}>
            <Avatar user={user} className={styles["drawer-header__avatar"]} />
            <Typography
                className={styles["drawer-header__name"]}
                use="headline6"
                theme="textPrimaryOnLight"
            >
                {name(user)}
            </Typography>
            <Badge type={user.type} />
        </div>
    );
};
