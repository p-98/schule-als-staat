import {
    Drawer as MaterialDrawer,
    DrawerHeader,
    DrawerTitle,
    DrawerContent,
} from "@rmwc/drawer";
import cn from "classnames";

// drawer imports
import "@material/drawer/dist/mdc.drawer.css";

// local
import { useFullscreen } from "Utility/hooks/redux/fullscreen";
import {
    useSelector,
    selectDrawerOpen,
    useDispatch,
    close,
} from "Utility/hooks/redux/drawer";
import { Navigation } from "./navigation";

import styles from "../_app.module.scss";

export const Drawer: React.FC = () => {
    const { locked: fullscreenInUse } = useFullscreen();
    const open = useSelector(selectDrawerOpen);

    const dispatch = useDispatch();

    return (
        <>
            <MaterialDrawer
                className={cn(
                    styles["app__drawer"],
                    open ? styles["app__drawer--open"] : "",
                    fullscreenInUse ? styles["app__drawer--transparent"] : ""
                )}
            >
                <DrawerHeader>
                    <DrawerTitle>Schule als Staat</DrawerTitle>
                </DrawerHeader>
                <DrawerContent>
                    <Navigation />
                </DrawerContent>
            </MaterialDrawer>
            <button
                onClick={() => dispatch(close())}
                className={cn(styles["app__drawer-scrim"], "mdc-drawer-scrim")}
                type="button"
                aria-label="close drawer"
            />
        </>
    );
};
