import { TopAppBar, TopAppBarRow } from "@rmwc/top-app-bar";
import {
    createContext,
    useState,
    useCallback,
    useMemo,
    useEffect,
    useContext,
} from "react";

// top-app-bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import {
    SiblingTransitionBase,
    Modes,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";

interface IControllerContext {
    registerInfo: (info: IDynamicAppBarInfo) => void;
    unregisterInfo: (info: IDynamicAppBarInfo) => void;
}
const ControllerContext = createContext<IControllerContext>({
    registerInfo: () => null,
    unregisterInfo: () => null,
});
ControllerContext.displayName = "DynamicAppBarControllerContext";
const DisplayContext = createContext<IDynamicAppBarInfo[]>([
    { navIcon: "", onNav: () => null, actionItems: [], title: "" },
]);
DisplayContext.displayName = "DynamicAppBarDisplayContext";

interface IDynamicAppBarInfo {
    navIcon: string;
    onNav: () => void;
    actionItems: { icon: string; onClick: () => void }[];
    title: string;
}

interface IDynamicAppBarProviderProps {
    defaultInfo: IDynamicAppBarInfo;
}
export const DynamicAppBarProvider: React.FC<IDynamicAppBarProviderProps> = ({
    children,
    defaultInfo,
}) => {
    // infoStack[0] represents the currently active app bar info
    const [infoStack, setInfoStack] = useState<IDynamicAppBarInfo[]>([
        defaultInfo,
    ]);

    const registerInfo = useCallback(
        (info: IDynamicAppBarInfo) =>
            // unshift info to infoStack
            setInfoStack((_infoStack) => [info, ..._infoStack]),
        [setInfoStack]
    );

    const unregisterInfo = useCallback(
        (info: IDynamicAppBarInfo) =>
            // delete given info object from array
            setInfoStack((_infoStack) =>
                _infoStack.filter((value) => value !== info)
            ),
        [setInfoStack]
    );

    const controllerContextValue = useMemo(
        () => ({ registerInfo, unregisterInfo }),
        [unregisterInfo, registerInfo]
    );

    return (
        <DisplayContext.Provider value={infoStack}>
            {/* This provider will never cause its consumers to rerender as the ref to its value should always be the same */}
            <ControllerContext.Provider value={controllerContextValue}>
                {children}
            </ControllerContext.Provider>
        </DisplayContext.Provider>
    );
};

interface IDynamicAppBarControllerProps {
    info: IDynamicAppBarInfo;
}
export const DynamicAppBarController: React.FC<IDynamicAppBarControllerProps> = ({
    info,
}) => {
    const controllerContext = useContext(ControllerContext);

    useEffect(() => {
        controllerContext.registerInfo(info);

        return () => controllerContext.unregisterInfo(info);
    }, [info, controllerContext]);

    return null;
};

export const DynamicAppBarDisplay: React.FC = () => {
    const displayContext = useContext(DisplayContext);

    return <TopAppBar></TopAppBar>;
};
