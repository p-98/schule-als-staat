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
import Navigation from "./navigation";

import styles from "../_app.module.scss";

interface IDrawerProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}
const Drawer: React.FC<IDrawerProps> = ({ open, setOpen }) => (
    <>
        <MaterialDrawer
            className={cn(
                styles["app__drawer"],
                open ? styles["app__drawer--open"] : ""
            )}
        >
            <DrawerHeader>
                <DrawerTitle>Schule als Staat</DrawerTitle>
            </DrawerHeader>
            <DrawerContent>
                <Navigation />
            </DrawerContent>
        </MaterialDrawer>
        <div
            onClick={() => setOpen(false)}
            className={cn(styles["app__drawer-scrim"], "mdc-drawer-scrim")}
            role="button"
            aria-label="close drawer"
        />
    </>
);
export default Drawer;
