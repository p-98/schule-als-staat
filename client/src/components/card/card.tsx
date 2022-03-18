/* eslint-disable react/jsx-props-no-spreading */
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
import { ListDivider, List } from "@rmwc/list";
import RMWC from "@rmwc/types";
import cn from "classnames";
import React, { forwardRef } from "react";

// card imports
import "@material/card/dist/mdc.card.css";
import "@material/button/dist/mdc.button.css";
import "@material/icon-button/dist/mdc.icon-button.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

// list imports
import "@material/list/dist/mdc.list.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

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
        {...restProps}
        className={cn(className, styles["card__media"])}
        ref={ref}
    />
));

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

export interface ICardContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    text?: string | React.ReactNode;
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
        {...restProps}
        className={cn(className, styles["card__chart-content"])}
        ref={ref}
    >
        <div className={styles["card__chart-wrapper"]}>{children}</div>
    </CardContent>
));

export interface ICardListContentProps
    extends React.HTMLAttributes<HTMLDivElement> {
    caption?: string;
    twoLine?: boolean;
}
export const CardListContent = forwardRef<
    HTMLDivElement,
    ICardListContentProps
>(({ children, className, caption, twoLine, ...restProps }, ref) => (
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
    > & { innerProps?: React.ComponentProps<typeof CardInner> }
> = ({ children, innerProps, ...restProps }) => (
    <RMWCCardPrimaryAction {...restProps}>
        <CardInner {...innerProps}>{children}</CardInner>
    </RMWCCardPrimaryAction>
);

export const CardDivider: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
    className,
    ...restProps
}) => (
    <ListDivider
        {...restProps}
        className={cn(className, styles["card__divider"])}
    />
);
