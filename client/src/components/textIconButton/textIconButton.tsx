import cn from "classnames";
import {
    IconButton,
    IconButtonProps,
    IconButtonHTMLProps,
} from "@rmwc/icon-button";
import { Typography } from "@rmwc/typography";
import RMWC from "@rmwc/types";

// icon-button imports
import "@material/icon-button/dist/mdc.icon-button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";

// typography imports
import "@material/typography/dist/mdc.typography.css";

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
