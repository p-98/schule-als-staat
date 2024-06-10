import {
    Drawer as RMWCDrawer,
    DrawerContent,
} from "Components/material/drawer";
import { ListDivider } from "Components/material/list";
import { FragmentType, graphql, useFragment } from "Utility/graphql";

import { Navigation } from "./navigation";
import { DrawerHeader } from "./drawerHeader";

import styles from "../_app.module.scss";

export const Drawer_SessionFragment = graphql(/* GraphQL */ `
    fragment Drawer_SessionFragment on Session {
        user {
            id
            ...DrawerHeader_UserFragment
        }
        ...Routing_UserFragment
    }
`);

interface IDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
    session: FragmentType<typeof Drawer_SessionFragment>;
}
export const Drawer: React.FC<IDrawerProps> = ({
    session: _session,
    ...restProps
}) => {
    const session = useFragment(Drawer_SessionFragment, _session);
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <RMWCDrawer {...restProps}>
            {session.user && (
                <>
                    <DrawerHeader user={session.user} />
                    <ListDivider className={styles["app__drawer-divider"]} />
                </>
            )}
            <DrawerContent>
                <Navigation session={session} />
            </DrawerContent>
        </RMWCDrawer>
    );
};
