import { useMemo } from "react";
import {
    FullscreenContainerTransformElement,
    FullscreenContainerTransformHandle,
} from "./subComponents";
import { TChildren, TChildrenMap } from "./types";

const childrenTypeMap = {
    Handle: FullscreenContainerTransformHandle,
    Element: FullscreenContainerTransformElement,
};

/**
 * check for correct children and return them
 */
const useChildren = (children: TChildren): TChildrenMap =>
    useMemo(() => {
        if (children.length !== 2) throw Error("Too many children");

        if (children[0]?.type !== childrenTypeMap["Handle"])
            throw Error("Invalid handle");
        if (children[1]?.type !== childrenTypeMap["Element"])
            throw Error("Invalid element");

        return {
            Handle: children[0],
            Element: children[1],
        };
    }, [children]);
export default useChildren;
