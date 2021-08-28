import { Typography } from "@rmwc/typography";
import {
    Card as RMWCCard,
    CardProps,
    CardActions as RMWCCardActions,
    CardActionsProps,
} from "@rmwc/card";
import RMWC from "@rmwc/types";
import cn from "classnames";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import styles from "./card.module.css";

// reexport rmwc card
export * from "@rmwc/card";

export const Card: React.FC<
    RMWC.ComponentProps<CardProps, React.HTMLProps<HTMLElement>, "div">
> = ({ className, children, ...restProps }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RMWCCard {...restProps} className={cn(className, styles["card"])}>
        {children}
    </RMWCCard>
);

export const CardHeader: React.FC = ({ children }) => (
    <Typography use="headline6" className={styles["card__header"]}>
        {children}
    </Typography>
);

export interface ICardContentProps {
    text?: string;
}
export const CardContent: React.FC<ICardContentProps> = ({
    text,
    children,
}) => (
    <div className={styles["card__content"]}>
        {/* if text is provided return Typography with text */}
        {text ? (
            <Typography use="body1" theme="textSecondaryOnBackground">
                {text}
            </Typography>
        ) : (
            children
        )}
    </div>
);

export const CardActions: React.FC<
    RMWC.ComponentProps<CardActionsProps, React.HTMLProps<HTMLElement>, "div">
> = ({ fullBleed, children, className, ...restProps }) => (
    <RMWCCardActions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        fullBleed={fullBleed}
        className={cn(
            className,
            fullBleed ? styles["card__actions--full-bleed"] : null
        )}
    >
        {children}
    </RMWCCardActions>
);
