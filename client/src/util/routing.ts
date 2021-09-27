export default [
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
        href: "/accountInfo",
        label: "Kontoinformationen",
        icon: "person",
    }),
] as (() => {
    href: string;
    label: string;
    icon: string;
})[];
