import React from "react";
import { any, constant } from "lodash/fp";
import { List, SimpleListItem } from "Components/material/list";
import Link from "next/link";
import { useRouter } from "next/router";

// local
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { UserRole } from "Utility/graphql/graphql";

import styles from "../_app.module.scss";

const Navigation_UserFragment = graphql(/* GraphQL */ `
    fragment Navigation_UserFragment on Session {
        user {
            roles
        }
    }
`);

interface IRoute {
    href: string;
    label: string;
    icon: string;
    authorized: (
        session: FragmentType<typeof Navigation_UserFragment>
    ) => boolean;
}

const always: IRoute["authorized"] = constant(true);
const never: IRoute["authorized"] = constant(false);
const role =
    (...roles: UserRole[]): IRoute["authorized"] =>
    (_session) => {
        const { user } = getFragment(Navigation_UserFragment, _session);
        if (!user) return false;
        return any((_) => user.roles.includes(_), roles);
    };

const routes: IRoute[] = [
    {
        href: "/test1",
        label: "Test 1",
        icon: "build",
        authorized: always,
    },
    {
        href: "/test2",
        label: "Test 2",
        icon: "build",
        authorized: always,
    },
    {
        href: "/products",
        label: "Produktverwaltung",
        icon: "category",
        authorized: role("COMPANY"),
    },
    {
        href: "/employees",
        label: "Mitarbeiterverwaltung",
        icon: "badge",
        authorized: role("COMPANY"),
    },
    {
        href: "/finances",
        label: "Finanzen",
        icon: "attach_money",
        authorized: role("COMPANY"),
    },
    {
        href: "/bank",
        label: "Bank",
        icon: "account_balance",
        authorized: role("BANK"),
    },
    {
        href: "/terminal/accountInfo",
        label: "Kontoinformationen",
        icon: "person",
        authorized: role("BORDER_CONTROL", "POLICE", "ADMIN"),
    },
    {
        href: "/bankAccountInfo",
        label: "Bankkonto",
        icon: "account_balance",
        authorized: role("USER"),
    },
    {
        href: "/vote",
        label: "Abstimmungen",
        icon: "ballot",
        authorized: role("CITIZEN"),
    },
    {
        href: "/pos",
        label: "Kasse",
        icon: "shopping_cart",
        authorized: role("COMPANY"),
    },
    {
        href: "/warehouse",
        label: "Warenlager",
        icon: "store",
        authorized: role("COMPANY"),
    },
    {
        href: "/borderControl",
        label: "Grenzkontolle",
        icon: "swap_horiz",
        authorized: role("BORDER_CONTROL"),
    },
    {
        href: "/orderSummary",
        label: "Einkaufslisten",
        icon: "add_shopping_cart",
        authorized: never,
    },
    {
        href: "/orders",
        label: "Bestellungen",
        icon: "store",
        authorized: never,
    },
    {
        href: "/login",
        label: "Login",
        icon: "login",
        authorized: always,
    },
];

export interface INavigationProps {
    session: FragmentType<typeof Navigation_UserFragment>;
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
