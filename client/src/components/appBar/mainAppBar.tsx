import { SimpleTopAppBar, SimpleTopAppBarProps } from "@rmwc/top-app-bar";
import cn from "classnames";
import RMWC from "@rmwc/types";

// top app bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import { useFullscreen } from "Utility/hooks/redux/fullscreen";
import { toggle, useDispatch } from "Utility/hooks/redux/drawer";

import styles from "./mainAppBar.module.css";

const MainAppBar: React.FC<
    RMWC.ComponentProps<
        SimpleTopAppBarProps,
        React.HTMLProps<HTMLElement>,
        "div"
    >
> = ({ className, ...restProps }) => {
    const { locked: fullscreenInUse } = useFullscreen();

    const dispatch = useDispatch();

    return (
        <SimpleTopAppBar
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...restProps}
            navigationIcon
            onNav={() => dispatch(toggle())}
            className={cn(
                styles["main-app-bar"],
                fullscreenInUse ? styles["main-app-bar--invisible"] : "",
                className
            )}
        />
    );
};
export default MainAppBar;
