import {
    IFullscreenContainerTransformElementProps,
    IFullscreenContainerTransformHandleProps,
} from "./subComponents";

export type TChildren = React.ReactElement<
    | IFullscreenContainerTransformElementProps
    | IFullscreenContainerTransformHandleProps
>[];

export type TChildrenMap = {
    Handle: React.ReactElement<IFullscreenContainerTransformHandleProps>;
    Element: React.ReactElement<IFullscreenContainerTransformElementProps>;
};
