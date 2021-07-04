import { Avatar } from "@rmwc/avatar";
import { Typography } from "@rmwc/typography";

// avatar imports
import "@rmwc/avatar/avatar.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import styles from "./userBanner.module.css";

interface UserBannerProps {
    label: string;
}
const UserBanner: React.FC<UserBannerProps> = ({ label }) => (
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

export default UserBanner;
