import { memo } from "react";
import { Typography } from "Components/material/typography";
import { Icon } from "Components/material/icon";

import { Avatar } from "Components/avatar/avatar";
import { FragmentType, graphql, useFragment } from "Utility/graphql";
import { name } from "Utility/data";

// local
import styles from "./userBanner.module.css";

export const UserBanner_UserFragment = graphql(/* GraphQL */ `
    fragment UserBanner_UserFragment on User {
        ...Name_UserFragment
        ...Avatar_UserFragment
    }
`);

interface UserBannerProps {
    label: string;
    user: FragmentType<typeof UserBanner_UserFragment>;
}
export const UserBanner: React.FC<UserBannerProps> = memo(
    ({ label, user: _user }) => {
        const user = useFragment(UserBanner_UserFragment, _user);

        return (
            <div className={styles["user-banner"]}>
                <Avatar
                    user={user}
                    className={styles["user-banner__avatar"]}
                    size="large"
                />
                <Typography
                    use="caption"
                    className={styles["user-banner__caption"]}
                >
                    {label}
                </Typography>
                <Typography
                    use="subtitle1"
                    className={styles["user-banner__name"]}
                >
                    {name(user)}
                </Typography>
            </div>
        );
    }
);
