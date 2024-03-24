import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectLoggedIn } from "Utility/redux/slices/companyAdminSlice";

export function useRedirect(url: string, condition = true): void {
    const router = useRouter();
    useEffect(() => {
        if (condition)
            router.push(url).catch((e) => {
                throw e;
            });
    }, [condition, router, url]);
}

/** Return true when executed on client side. */
export function useEnsureClient(): boolean {
    const [isClient, setIsClient] = useState(false);
    useEffect(() => setIsClient(true), []);
    return isClient;
}

export function useCompanyAdminRedirect(): void {
    const companyAdminLoggedIn = useSelector(selectLoggedIn);
    useRedirect("/", !companyAdminLoggedIn);
}
