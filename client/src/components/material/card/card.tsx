/* eslint-disable react/jsx-props-no-spreading */
import { Typography } from "@rmwc/typography";
import {
    Card as RMWCCard,
    CardProps as RMWCCardProps,
    CardActions as RMWCCardActions,
    CardActionsProps as RMWCCardActionsProps,
    CardMedia as RMWCCardMedia,
    CardMediaProps as RMWCCardMediaProps,
    CardPrimaryAction as RMWCCardPrimaryAction,
    CardMediaContentProps as RMWCCardMediaContentProps,
} from "@rmwc/card";
import { ListDivider, List } from "@rmwc/list";
import RMWC from "@rmwc/types";
import cn from "classnames";
import React, { forwardRef } from "react";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/ripple/ripple.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// list imports
import "@material/list/dist/mdc.list.css";

// local
import { TWithThemeProp } from "Utility/types";

import styles from "./card.module.css";

// reexport rmwc card
export * from "@rmwc/card";

export const cardClassNames = cn("mdc-card", styles["card"]);

export type CardProps = React.ComponentProps<typeof Card>;
export const Card = forwardRef<
    HTMLDivElement,
    RMWC.ComponentProps<RMWCCardProps, React.HTMLProps<HTMLElement>, "div">
>(({ className, children, ...restProps }, ref) => (
    <RMWCCard
        {...restProps}
        className={cn(className, styles["card"])}
        ref={ref}
    >
        {children}
    </RMWCCard>
));

export type CardInnerProps = React.ComponentProps<typeof CardInner>;
export const CardInner = forwardRef<
    HTMLDivElement,
    React.ComponentProps<typeof Card>
>(({ className, ...restProps }, ref) => (
    <Card
        {...restProps}
        className={cn(className, styles["card__inner"])}
        ref={ref}
    />
));

export type CardMediaProps = React.ComponentProps<typeof CardMedia>;
export const CardMedia = forwardRef<
    HTMLDivElement,
    RMWC.ComponentProps<RMWCCardMediaProps, React.HTMLProps<HTMLElement>, "div">
>(({ className, ...restProps }, ref) => (
    <RMWCCardMedia
        {...restProps}
        className={cn(className, styles["card__media"])}
        ref={ref}
    />
));

export type CardHeaderProps = React.ComponentProps<typeof CardHeader>;
export const CardHeader: React.FC<
    TWithThemeProp<React.HTMLAttributes<HTMLDivElement>>
> = ({ children, className, theme, ...restProps }) => (
    <Typography
        {...restProps}
        use="headline6"
        className={cn(className, styles["card__header"])}
        theme={theme ?? "textPrimaryOnBackground"}
    >
        {children}
    </Typography>
);
export type CardSubtitleProps = React.ComponentProps<typeof CardSubtitle>;
export const CardSubtitle: React.FC<
    TWithThemeProp<React.HTMLAttributes<HTMLDivElement>>
> = ({ children, className, theme, ...restProps }) => (
    <Typography
        {...restProps}
        use="subtitle2"
        className={cn(className, styles["card__subtitle"])}
        theme={theme ?? "textSecondaryOnBackground"}
    >
        {children}
    </Typography>
);

export interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
    text?: string | React.ReactNode;
}
export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
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

export type CardChartContentProps = React.ComponentProps<
    typeof CardChartContent
>;
export const CardChartContent = forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ children, className, ...restProps }, ref) => (
    <CardContent
        {...restProps}
        className={cn(className, styles["card__chart-content"])}
        ref={ref}
    >
        <div className={styles["card__chart-wrapper"]}>{children}</div>
    </CardContent>
));

export interface CardListContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    caption?: string;
    twoLine?: boolean;
}
export const CardListContent = forwardRef<HTMLDivElement, CardListContentProps>(
    ({ children, className, caption, twoLine, ...restProps }, ref) => (
        <CardContent {...restProps} className={className} ref={ref}>
            {caption && (
                <Typography
                    use="caption"
                    theme="textPrimaryOnBackground"
                    className={cn(
                        styles["card__list-caption"],
                        twoLine && styles["card__list-caption--twoline"]
                    )}
                >
                    {caption}
                </Typography>
            )}
            <List className={styles["card__list"]} twoLine={twoLine}>
                {children}
            </List>
        </CardContent>
    )
);

export type CardActionsProps = RMWC.ComponentProps<
    RMWCCardActionsProps,
    React.HTMLProps<HTMLElement>,
    "div"
> & { dialogLayout?: boolean };
/** When dialogLayout is used, the CardActionButtons component must be emitted */
export const CardActions: React.FC<CardActionsProps> = ({
    fullBleed,
    children,
    className,
    dialogLayout,
    ...restProps
}) => (
    <RMWCCardActions
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

export type CardPrimaryActionProps = React.ComponentProps<
    typeof CardPrimaryAction
>;
export const CardPrimaryAction: React.FC<
    RMWC.ComponentProps<
        RMWCCardMediaContentProps,
        React.HTMLProps<HTMLElement>,
        "div"
    > & { innerProps?: React.ComponentProps<typeof CardInner> }
> = ({ children, innerProps, ...restProps }) => (
    <RMWCCardPrimaryAction {...restProps}>
        <CardInner {...innerProps}>{children}</CardInner>
    </RMWCCardPrimaryAction>
);

export type CardDividerProps = React.ComponentProps<typeof CardDivider>;
export const CardDivider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...restProps
}) => (
    <ListDivider
        {...restProps}
        className={cn(className, styles["card__divider"])}
    />
);
