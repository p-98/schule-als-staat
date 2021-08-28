/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

const routingObj: (() => {
    label: string;
    href: string;
    icon: string;
})[] = [
    () => ({
        href: "test1",
        label: "Test 1",
        icon: "build",
    }),
    () => ({
        href: "test2",
        label: "Test 2",
        icon: "build",
    }),
    () => ({
        href: "login",
        label: "Login",
        icon: "login",
    }),
    () => ({
        href: "bank",
        label: "Bank",
        icon: "account_balance",
    }),
];
export default routingObj;
