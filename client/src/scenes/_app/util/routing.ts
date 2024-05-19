import { any, constant } from "lodash/fp";
import { useRouter } from "next/router";
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { UserRole } from "Utility/graphql/graphql";
import { dispatch } from "Utility/misc";

export const Routing_UserFragment = graphql(/* GraphQL */ `
    fragment Routing_UserFragment on Session {
        user {
            roles
        }
    }
`);

interface IRoute {
    href: string;
    label: string;
    icon: string;
    authorized: (session: FragmentType<typeof Routing_UserFragment>) => boolean;
}

const always: IRoute["authorized"] = constant(true);
const never: IRoute["authorized"] = constant(false);
const role =
    (...roles: UserRole[]): IRoute["authorized"] =>
    (_session) => {
        const { user } = getFragment(Routing_UserFragment, _session);
        if (!user) return false;
        return any((_) => user.roles.includes(_), roles);
    };

export const routes: IRoute[] = [
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
        href: "/admin",
        label: "Administration",
        icon: "key",
        authorized: role("ADMIN"),
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

/** Route object of the current page
 *
 * Throws if route is unknown.
 */
const useRoute = (): IRoute => {
    const router = useRouter();
    const route = routes.find((_) => _.href === router.asPath);
    if (!route) throw Error(`Route ${router.asPath} not found.`);
    return route;
};

/** Check authorization and redirect if needed */
export const useCheckAuth = (
    user?: FragmentType<typeof Routing_UserFragment>
): boolean => {
    const router = useRouter();
    const route = useRoute();
    if (!user) return false;

    if (!route.authorized(user)) {
        dispatch(router.replace("/login"));
        return false;
    }
    return true;
};
