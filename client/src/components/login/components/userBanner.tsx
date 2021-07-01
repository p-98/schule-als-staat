import { Card } from "@rmwc/card";
import { Chip } from "@rmwc/chip";
import { Avatar } from "@rmwc/avatar";
import { Typography } from "@rmwc/typography";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// chip imports
import "@material/chips/dist/mdc.chips.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// avatar imports
import "@rmwc/avatar/avatar.css";
// import "@rmwc/icon/icon.css";
// import "@material/ripple/dist/mdc.ripple.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import styles from "./userBanner.module.css";

const UserBanner: React.FC = () => (
    <div className={styles["user-banner"]}>
        <Chip
            label="Max Mustermann"
            icon={<Avatar src="/profile.jpg" name="Max Mustermann" />}
        />
    </div>
);

const UserBanner2: React.FC = () => (
    <div className={styles["user-banner-2"]}>
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
                Anmelden als
            </Typography>
            <Typography use="subtitle1">Max Mustermann</Typography>
        </div>
    </div>
);

export default UserBanner2;
