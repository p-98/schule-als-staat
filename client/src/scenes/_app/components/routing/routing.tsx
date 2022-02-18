// local
import { selectLoggedIn } from "Utility/redux/slices/companyAdminSlice";
import { store } from "Utility/redux/store";
import {
    Top as CompanyAdminTop,
    Bottom as CompanyAdminBottom,
} from "./companyAdministration";

export default [
    () => <CompanyAdminTop key="CompanyAdminTop" />,
    () => ({
        href: "/products",
        label: "Produktverwaltung",
        icon: "category",
        disabled: !selectLoggedIn(store.getState()),
    }),
    () => ({
        href: "/finances",
        label: "Finanzen",
        icon: "attach_money",
        disabled: !selectLoggedIn(store.getState()),
    }),
    ({ forceUpdate }) => (
        <CompanyAdminBottom
            key="CompanyAdminBottom"
            forceNavUpdate={forceUpdate}
        />
    ),
    () => ({
        href: "/test1",
        label: "Test 1",
        icon: "build",
    }),
    () => ({
        href: "/test2",
        label: "Test 2",
        icon: "build",
    }),
    () => ({
        href: "/login",
        label: "Login",
        icon: "login",
    }),
    () => ({
        href: "/bank",
        label: "Bank",
        icon: "account_balance",
    }),
    () => ({
        href: "/terminal/accountInfo",
        label: "Kontoinformationen",
        icon: "person",
    }),
    () => ({
        href: "/bankAccountInfo",
        label: "Bankkonto",
        icon: "account_balance",
    }),
    () => ({
        href: "/vote",
        label: "Abstimmungen",
        icon: "ballot",
    }),
    () => ({
        href: "/pos",
        label: "Kasse",
        icon: "shopping_cart",
    }),
    () => ({
        href: "/warehouse",
        label: "Warenlager",
        icon: "store",
    }),
    () => ({
        href: "/borderControl",
        label: "Grenzkontolle",
        icon: "swap_horiz",
    }),
    () => ({
        href: "/orderSummary",
        label: "Einkaufslisten",
        icon: "add_shopping_cart",
    }),
    () => ({
        href: "/orders",
        label: "Bestellungen",
        icon: "store",
    }),
] as ((props: {
    forceUpdate: () => void;
}) =>
    | {
          href: string;
          label: string;
          icon: string;
          disabled?: boolean;
      }
    | React.ReactElement)[];
