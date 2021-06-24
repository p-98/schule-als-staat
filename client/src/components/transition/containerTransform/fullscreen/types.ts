import {
    FullscreenContainerTransformElementProps,
    FullscreenContainerTransformHandleProps,
} from "./subComponents";

export type TChildren = React.ReactElement<
    | FullscreenContainerTransformElementProps
    | FullscreenContainerTransformHandleProps
>[];

export type TChildrenMap = {
    Handle: React.ReactElement<FullscreenContainerTransformHandleProps>;
    Element: React.ReactElement<FullscreenContainerTransformElementProps>;
};
