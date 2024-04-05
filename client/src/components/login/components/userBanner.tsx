import { memo } from "react";
import { Avatar } from "Components/material/avatar";
import { Typography } from "Components/material/typography";
import { Icon } from "Components/material/icon";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

// local
import styles from "./userBanner.module.css";

export const UserBanner_UserFragment = graphql(/* GraphQL */ `
    fragment UserBanner_UserFragment on User {
        ... on CitizenUser {
            name
            image
        }
        ... on CompanyUser {
            name
            image
        }
        ... on GuestUser {
            guestName: name
        }
    }
`);

interface UserBannerProps {
    label: string;
    user: FragmentType<typeof UserBanner_UserFragment>;
}
export const UserBanner: React.FC<UserBannerProps> = memo(
    ({ label, user: _user }) => {
        const user = useFragment(UserBanner_UserFragment, _user);
        const name =
            user.__typename === "GuestUser"
                ? user.guestName ?? "Gast"
                : user.name;

        return (
            <div className={styles["user-banner"]}>
                {user.__typename === "GuestUser" ? (
                    <Icon
                        className={styles["user-banner__avatar"]}
                        icon={{ icon: "person", size: "large" }}
                    />
                ) : (
                    <Avatar
                        className={styles["user-banner__avatar"]}
                        src="/profile.jpg"
                        name="Max Mustermann"
                        size="large"
                    />
                )}
                <div className={styles["user-banner__label"]}>
                    <Typography
                        use="caption"
                        className={styles["user-banner__caption"]}
                    >
                        {label}
                    </Typography>
                    <Typography use="subtitle1">{name}</Typography>
                </div>
            </div>
        );
    }
);
