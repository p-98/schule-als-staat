import { Icon } from "@rmwc/icon";
import { Typography } from "@rmwc/typography";
import { Theme } from "@rmwc/theme";
import { IconPropT } from "@rmwc/types";
import cn from "classnames";

// icon imports
import "@rmwc/icon/icon.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import styles from "./displayInfo.module.css";

interface IDisplayInfoProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    icon?: IconPropT;
    activated?: boolean;
    selected?: boolean;
}
const DisplayInfo: React.FC<IDisplayInfoProps> = ({
    label,
    icon,
    children,
    activated = false,
    selected = false,
    ...restProps
}) => (
    <div
        {...restProps}
        className={cn(
            restProps.className,
            styles["display-info"],
            activated && styles["display-info--activated"],
            selected && styles["display-info--selected"],
            icon && styles["display-info--icon"]
        )}
    >
        {icon && (
            <Theme use="textSecondaryOnBackground" wrap>
                <Icon
                    icon={{ icon, size: "large" }}
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
    </div>
);

export default DisplayInfo;
