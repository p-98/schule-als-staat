import { Avatar } from "Components/material/avatar";
import { Typography } from "Components/material/typography";

// local
import styles from "./userBanner.module.css";

interface UserBannerProps {
    label: string;
}
export const UserBanner: React.FC<UserBannerProps> = ({ label }) => (
    <div className={styles["user-banner"]}>
        <Avatar
            className={styles["user-banner__avatar"]}
            src="/profile.jpg"
            name="Max Mustermann"
            size="large"
        />
        <div className={styles["user-banner__label"]}>
            <Typography
                use="caption"
                className={styles["user-banner__caption"]}
            >
                {label}
            </Typography>
            <Typography use="subtitle1">Max Mustermann</Typography>
        </div>
    </div>
);
