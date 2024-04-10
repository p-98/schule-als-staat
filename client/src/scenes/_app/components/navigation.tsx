import React from "react";
import { List, SimpleListItem } from "Components/material/list";
import Link from "next/link";
import { useRouter } from "next/router";
import { FragmentType } from "Utility/graphql";
import { routes, Routing_UserFragment } from "../util/routing";

import styles from "../_app.module.scss";

export interface INavigationProps {
    session: FragmentType<typeof Routing_UserFragment>;
}
export const Navigation: React.FC<INavigationProps> = ({ session }) => {
    const { pathname } = useRouter();
    return (
        <List>
            {routes.map((route) => {
                const { href, label, icon, authorized } = route;
                if (!authorized(session)) return undefined;
                return (
                    // prefetching is disabled because it would preload literally every page
                    <Link
                        href={href}
                        passHref
                        prefetch={false}
                        key={label}
                        legacyBehavior
                    >
                        <SimpleListItem
                            graphic={icon}
                            text={label}
                            key={label}
                            activated={`${pathname}/`.startsWith(`${href}/`)}
                            className={styles[".navigation__list-item"]}
                        />
                    </Link>
                );
            })}
        </List>
    );
};
