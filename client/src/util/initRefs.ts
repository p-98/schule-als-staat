import { Ref } from "react";

/* eslint-disable no-param-reassign */
export const initRefsFactory = <T>(
    ...refs: Ref<T>[]
): ((instance: T | null) => void) => (instance) => {
    refs.forEach((ref) => {
        if (!ref) return;

        if (typeof ref === "function") return ref(instance);

        // @ts-expect-error react declares ref objects immutable for some reason
        ref.current = instance;
    });
};
/* eslint-enable no-param-reassign */
