import { Avatar } from "Components/material/avatar";
import { Typography } from "Components/material/typography";
import { ThemePropT } from "Components/material/types";

// local
import styles from "./drawerHeader.module.css";

const badgeStyles = {
    company: {
        background: "#2962ff",
        theme: "textPrimaryOnDark",
        text: "Unternehmen",
    },
    citizen: {
        background: "#00c853",
        theme: "textPrimaryOnLight",
        text: "Bürger",
    },
    guest: {
        background: "#ffab00",
        theme: "textPrimaryOnLight",
        text: "Gast",
    },
    admin: {
        background: "#d50000",
        theme: "textPrimaryOnDark",
        text: "Administrator",
    },
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

export const DrawerHeader: React.FC = () => (
    <div className={styles["drawer-header"]}>
        <Avatar
            className={styles["drawer-header__avatar"]}
            src="/profile.jpg"
            name="Max Mustermann"
        />
        <Typography use="headline6" theme="textPrimaryOnLight">
            Max Mustermann
        </Typography>
        <Badge type="guest" />
    </div>
);
