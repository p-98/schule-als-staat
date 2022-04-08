import { Icon } from "Components/material/icon";
import { Typography } from "Components/material/typography";
import { Theme } from "Components/material/theme";
import { IconPropT } from "Components/material/types";
import cn from "classnames";

// local
import { HightlightStates } from "Components/highlightStates/highlightStates";

import styles from "./displayInfo.module.css";

interface IDisplayInfoProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    icon?: IconPropT;
    trailingIcon?: IconPropT;
    activated?: boolean;
    selected?: boolean;
}
export const DisplayInfo: React.FC<IDisplayInfoProps> = ({
    label,
    icon,
    trailingIcon,
    children,
    activated = false,
    selected = false,
    ...restProps
}) => (
    <HightlightStates activated={activated} selected={selected}>
        <div
            {...restProps}
            className={cn(
                restProps.className,
                styles["display-info"],
                (activated || selected) && styles["display-info--highlighted"],
                icon && styles["display-info--with-icon"],
                trailingIcon && styles["display-info--with-trailing-icon"]
            )}
        >
            {icon && (
                <Theme use="textSecondaryOnBackground" wrap>
                    <Icon
                        icon={{
                            ...(typeof icon === "object" ? icon : { icon }),
                            size: "large",
                        }}
                        className={styles["display-info__icon"]}
                    />
                </Theme>
            )}
            <div className={styles["display-info__label"]}>
                <Typography
                    use="caption"
                    className={styles["display-info__caption"]}
                    theme="textSecondaryOnBackground"
                >
                    {label}
                </Typography>
                <Typography use="subtitle1" theme="textPrimaryOnBackground">
                    {children}
                </Typography>
            </div>
            {trailingIcon && (
                <Theme use="textSecondaryOnBackground" wrap>
                    <Icon
                        icon={{
                            ...(typeof trailingIcon === "object"
                                ? trailingIcon
                                : { icon: trailingIcon }),
                            size: "large",
                        }}
                        className={cn(
                            styles["display-info__icon"],
                            styles["display-info__icon--trailing"]
                        )}
                    />
                </Theme>
            )}
        </div>
    </HightlightStates>
);
