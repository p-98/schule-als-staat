import { any, constant, isNil, isUndefined } from "lodash/fp";
import { useRouter } from "next/router";
import { useEffect, useMemo } from "react";
import {
    FragmentType,
    graphql,
    useFragment as getFragment,
} from "Utility/graphql";
import { UserRole } from "Utility/graphql/graphql";
import { syncify } from "Utility/misc";

export const Routing_SessionFragment = graphql(/* GraphQL */ `
    fragment Routing_SessionFragment on Session {
        user {
            id
            roles
        }
    }
`);

interface IRoute {
    href: string;
    label: string;
    icon: string;
    authorized: (
        session: FragmentType<typeof Routing_SessionFragment>
    ) => boolean;
}

const always: IRoute["authorized"] = constant(true);
const never: IRoute["authorized"] = constant(false);
const role =
    (...roles: UserRole[]): IRoute["authorized"] =>
    (_session) => {
        const { user } = getFragment(Routing_SessionFragment, _session);
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
        href: "/attendance",
        label: "Anwesenheit",
        icon: "location_on",
        authorized: role("ADMIN", "TEACHER"),
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

/** SSE-safe way to perform a redirect
 *
 * @param url the url to redirect to
 * @returns function triggering the redirect
 */
const useRedirect = (redirect: boolean, url: string) => {
    const router = useRouter();
    useEffect(() => {
        if (!redirect) return;
        syncify(router.replace(url));
        // router is not ref-stable
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [redirect, url, router.asPath]);
};

type Nullable<T> = T | null | undefined;
/** Check if the route exists and the user is authorization
 *
 * Redirects if conditions are not met.
 * @param session the session. If not an object,
 *        it is treated as not yet loaded and will not redirect
 * @returns undefined, if user.fetching. Whether checks passed, otherwise.
 */
export const useCheckRouteAndAuth = (
    session: Nullable<FragmentType<typeof Routing_SessionFragment>>
): boolean | undefined => {
    const router = useRouter();
    const route = useMemo(
        () => routes.find((_) => _.href === router.asPath),
        [router.asPath]
    );

    const invalidRoute = isUndefined(route);
    const invalidAuth = isNil(session)
        ? false // don't redirect if the session has not loaded yet
        : !route?.authorized(session) ?? false;
    useRedirect(invalidRoute || invalidAuth, "/login");
    return !(invalidRoute || invalidAuth);
};
