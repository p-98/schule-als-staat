import { useCallback, useState } from "react";
import { v4 as uuid } from "uuid";

/**
 * usage:
 * const [key, forceRemount] = useForceRemount()
 */
export const useForceRemount = (): [string, () => void] => {
    const [key, setKey] = useState(uuid());

    const forceRemount = useCallback(() => setKey(uuid()), []);

    return [key, forceRemount];
};
