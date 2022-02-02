import { useRouter } from "next/router";
import { useSelector } from "react-redux";
import { selectLoggedIn } from "Utility/redux/slices/companyAdminSlice";

export function useRedirect(url: string, condition = true): void {
    const router = useRouter();
    if (condition)
        router.push(url).catch((e) => {
            throw e;
        });
}

export function useCompanyAdminRedirect(): void {
    const companyAdminLoggedIn = useSelector(selectLoggedIn);
    useRedirect("/", !companyAdminLoggedIn);
}
