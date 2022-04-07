import cn from "classnames";
import {
    IconButton,
    IconButtonProps,
    IconButtonHTMLProps,
} from "Components/material/icon-button";
import { Typography } from "Components/material/typography";
import RMWC from "Components/material/types";

// local
import styles from "./textIconButton.module.css";

type ITextIconButtonProps = Omit<
    RMWC.ComponentProps<IconButtonProps, IconButtonHTMLProps, "button">,
    "icon"
> & {
    text: string;
};
export const TextIconButton: React.FC<ITextIconButtonProps> = ({
    text,
    ...restProps
}) => (
    <IconButton
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...restProps}
        className={cn(styles["text-icon-button"], restProps.className)}
        icon={
            <Typography
                use="overline"
                className={styles["text-icon-button__text"]}
            >
                {text}
            </Typography>
        }
    />
);
