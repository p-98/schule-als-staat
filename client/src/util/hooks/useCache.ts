import { useMemo, useState } from "react";

/** Use the last non-undefined value of an variable */
export const useCache = <T>(v: T): T => {
    const [cache, setCache] = useState(v);
    useMemo(() => v !== undefined && setCache(v), [v]);

    return v !== undefined ? v : cache;
};
