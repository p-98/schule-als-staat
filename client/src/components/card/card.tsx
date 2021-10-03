import { Typography } from "@rmwc/typography";
import {
    Card as RMWCCard,
    CardProps,
    CardActions as RMWCCardActions,
    CardActionsProps,
} from "@rmwc/card";
import RMWC from "@rmwc/types";
import cn from "classnames";
import { forwardRef } from "react";

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

export const Card = forwardRef<
    HTMLDivElement,
    RMWC.ComponentProps<CardProps, React.HTMLProps<HTMLElement>, "div">
>(({ className, children, ...restProps }, ref) => (
    <RMWCCard
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(className, styles["card"])}
        ref={ref}
    >
        {children}
    </RMWCCard>
));

export const CardInner = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof Card>
>(({ className, ...restProps }, ref) => (
    <Card
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(className, styles["card__inner"])}
        ref={ref}
    />
));

export const CardHeader: React.FC = ({ children }) => (
    <Typography use="headline6" className={styles["card__header"]}>
        {children}
    </Typography>
);

export interface ICardContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    text?: string;
}
export const CardContent = forwardRef<HTMLDivElement, ICardContentProps>(
    ({ text, children, ...restProps }, ref) => (
        <div
            {...restProps}
            className={cn(restProps.className, styles["card__content"])}
            ref={ref}
        >
            {/* if text is provided return Typography with text */}
            {text ? (
                <Typography use="body1" theme="textSecondaryOnBackground">
                    {text}
                </Typography>
            ) : (
                children
            )}
        </div>
    )
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
