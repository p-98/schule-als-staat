import { type FC, type ReactNode, memo } from "react";
import { Typography } from "Components/material/typography";
import { Icon } from "Components/material/icon";
import { Theme } from "Components/material/theme";

import css from "./fallbackText.module.css";

const FallbackTextMain: FC<{ children: ReactNode }> = memo(({ children }) => (
    <Theme
        use="textSecondaryOnBackground"
        tag="div"
        className={css["fallback-text"]}
    >
        {children}
    </Theme>
));
const FallbackTextText: FC<{ children: ReactNode }> = memo(({ children }) => (
    <Typography use="body1">{children}</Typography>
));
const FallbackTextIcon: FC<{ icon: ReactNode | string }> = ({ icon }) => {
    if (typeof icon !== "string") return <>{icon}</>;
    return <Icon icon={icon} />;
};

interface FallbackTextProps {
    icon: ReactNode | string;
    text: string;
}
export const FallbackText: FC<FallbackTextProps> = ({ icon, text }) => (
    <FallbackTextMain>
        <FallbackTextIcon icon={icon} />
        <FallbackTextText>{text}</FallbackTextText>
    </FallbackTextMain>
);
