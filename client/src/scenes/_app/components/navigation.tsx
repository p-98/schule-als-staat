import React from "react";
import { List, SimpleListItem } from "Components/material/list";
import Link from "next/link";
import { useRouter } from "next/router";
import cn from "classnames";

// local
import routingObj from "Scenes/_app/components/routing/routing";
import { useForceUpdate } from "Utility/hooks/forceUpdate";

import styles from "../_app.module.scss";

export const Navigation: React.FC = () => {
    const { pathname } = useRouter();
    const forceUpdate = useForceUpdate();

    return (
        <List>
            {routingObj.map((generator) => {
                const route = generator({ forceUpdate });

                if (React.isValidElement(route)) return route;

                const { label, href, icon, disabled } = route;
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
                            // manual disabled state to affect icon and work around SimpleListItem not displaying properly
                            className={cn(
                                styles[".navigation__list-item"],
                                disabled &&
                                    styles["navigation__list-item--disabled"]
                            )}
                            tabIndex={disabled ? -1 : 0}
                        />
                    </Link>
                );
            })}
        </List>
    );
};
