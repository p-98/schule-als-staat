import { Typography } from "@rmwc/typography";
import {
    Card as RMWCCard,
    CardProps,
    CardActions as RMWCCardActions,
    CardActionsProps,
    CardMedia as RMWCCardMedia,
    CardMediaProps,
    CardPrimaryAction as RMWCCardPrimaryAction,
    CardMediaContentProps,
} from "@rmwc/card";
import RMWC from "@rmwc/types";
import cn from "classnames";
import React, { forwardRef } from "react";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// local
import { TWithThemeProp } from "Utility/types";

import styles from "./card.module.css";

// reexport rmwc card
export * from "@rmwc/card";

export const cardClassNames = cn("mdc-card", styles["card"]);

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

export const CardMedia = forwardRef<
    HTMLDivElement,
    RMWC.ComponentProps<CardMediaProps, React.HTMLProps<HTMLElement>, "div">
>(({ className, ...restProps }, ref) => (
    <RMWCCardMedia
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(className, styles["card__media"])}
        ref={ref}
    />
));

export const CardHeader: React.FC<
    TWithThemeProp<React.HTMLAttributes<HTMLDivElement>>
> = ({ children, className, theme, ...restProps }) => (
    <Typography
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        use="headline6"
        className={cn(className, styles["card__header"])}
        theme={theme ?? "textPrimaryOnBackground"}
    >
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
export const CardChartContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...restProps }, ref) => (
    <CardContent
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(className, styles["card__chart-content"])}
        ref={ref}
    >
        <div className={styles["card__chart-wrapper"]}>{children}</div>
    </CardContent>
));

export type ICardActionsProps = RMWC.ComponentProps<
    CardActionsProps,
    React.HTMLProps<HTMLElement>,
    "div"
> & { dialogLayout?: boolean };
/** When dialogLayout is used, the CardActionButtons component must be emitted */
export const CardActions: React.FC<ICardActionsProps> = ({
    fullBleed,
    children,
    className,
    dialogLayout,
    ...restProps
}) => (
    <RMWCCardActions
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        fullBleed={fullBleed}
        className={cn(
            className,
            styles["card__actions"],
            fullBleed && styles["card__actions--full-bleed"],
            dialogLayout && styles["card__actions--dialog-layout"]
        )}
    >
        {children}
    </RMWCCardActions>
);

export const CardPrimaryAction: React.FC<
    RMWC.ComponentProps<
        CardMediaContentProps,
        React.HTMLProps<HTMLElement>,
        "div"
    >
> = ({ children, ...restProps }) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <RMWCCardPrimaryAction {...restProps}>
        <CardInner>{children}</CardInner>
    </RMWCCardPrimaryAction>
);
