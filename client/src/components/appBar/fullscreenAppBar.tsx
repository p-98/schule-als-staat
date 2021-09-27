import { SimpleTopAppBarProps, SimpleTopAppBar } from "@rmwc/top-app-bar";
import RMWC from "@rmwc/types";

// top app bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

export type IFullscreenAppBarProps = Omit<
    RMWC.ComponentProps<
        SimpleTopAppBarProps,
        React.HTMLProps<HTMLElement>,
        "div"
    >,
    "navigationIcon"
>;
export const FullscreenAppBar: React.FC<IFullscreenAppBarProps> = (props) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <SimpleTopAppBar {...props} navigationIcon={{ icon: "arrow_back" }} />
);
