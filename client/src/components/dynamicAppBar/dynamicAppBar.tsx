import { createPortal } from "react-dom";
import React, {
    HTMLAttributes,
    useEffect,
    useRef,
    useState,
    useMemo,
    ReactElement,
} from "react";
import {
    TopAppBar,
    TopAppBarRow,
    TopAppBarSection,
    TopAppBarNavigationIcon,
    TopAppBarTitle,
    TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { ThemeProvider } from "@rmwc/theme";
import cn from "classnames";

// theme imports
import "@material/theme/dist/mdc.theme.css";
import "@rmwc/theme/theme.css";

// top-app-bar imports
import "@material/top-app-bar/dist/mdc.top-app-bar.css";
import "@material/icon-button/dist/mdc.icon-button.css";
import "@material/ripple/dist/mdc.ripple.css";
import "@rmwc/icon/icon.css";

// local
import styles from "./dynamicAppBar.module.scss";

const displayID = "dynamic-app-bar";

export const DynamicAppBarDisplay: React.FC = () => {
    const ref = useRef<HTMLDivElement>(null);

    // disable tabfocus on invisible buttons
    useEffect(() => {
        const dom = ref.current;
        if (!dom) return;

        const mutationCallback = () => {
            const buttons = dom.getElementsByTagName("button");
            const activeAppBar = dom.lastElementChild;

            // no app bar rendered
            if (!activeAppBar) return;

            Array.from(buttons).forEach((button) => {
                const isButtonActive = activeAppBar.contains(button);
                // eslint-disable-next-line no-param-reassign
                button.tabIndex = isButtonActive ? 0 : -1;
            });
        };

        const observer = new MutationObserver(mutationCallback);
        observer.observe(dom, { childList: true });

        return () => observer.disconnect();
    }, []);

    return (
        <div ref={ref} className={styles["dynamic-app-bar"]} id={displayID} />
    );
};

export interface IDynamicAppBarHandleProp
    extends HTMLAttributes<HTMLHeadElement> {
    /** default true */
    render?: boolean;
    /** for changes to take effect, component must be remounted */
    navIcon?: { icon: string; onNav: () => void } | ReactElement;
    /** for changes to take effect, component must be remounted */
    actionItems?: { icon: string; onClick: () => void }[];
    /** for changes to take effect, component must be remounted */
    title?: string;
    /** for changes to take effect, component must be remounted */
    color?: string;
}
export const DynamicAppBarHandle: React.FC<IDynamicAppBarHandleProp> = ({
    render: renderTarget = true,
    navIcon,
    actionItems,
    title,
    color,
    ...restProps
}) => {
    const infoRef = useRef({ navIcon, actionItems, title, color, restProps });
    const appBarRef = useRef<HTMLHeadElement>(null);
    const [render, setRender] = useState(false);
    /** preserves state between render cycles */
    const [transitionCache, setTransitionCache] = useState<{
        renderTarget: boolean;
    } | null>(null);

    useEffect(() => {
        if (render === renderTarget) return;
        if (transitionCache) return;

        setTransitionCache({ renderTarget });
        setRender(true);
    }, [render, renderTarget, transitionCache]);

    // runs one render cycle after previous effect
    useEffect(() => {
        if (!transitionCache) return;

        if (!appBarRef.current) return;
        const appBarDOM = appBarRef.current;
        const appBarWrapperDOM = appBarDOM.parentElement
            ?.parentElement as HTMLElement;
        const animate = appBarWrapperDOM.childElementCount > 1;

        const finalizeState = () => {
            setRender(transitionCache.renderTarget);
            setTransitionCache(null);
        };

        if (animate) {
            appBarDOM.style.transition = transitionCache.renderTarget
                ? "opacity 300ms cubic-bezier(0, 0, 0.2, 1)"
                : "opacity 250ms cubic-bezier(0.4, 0, 1, 1)";

            appBarDOM.ontransitionend = () => {
                finalizeState();
            };
        }

        appBarDOM.style.opacity = transitionCache.renderTarget ? "1" : "0";

        if (!animate) finalizeState();
    }, [transitionCache]);

    return useMemo(() => {
        if (!render) return null;

        const info = infoRef.current;
        return createPortal(
            <ThemeProvider options={info.color ? { primary: info.color } : {}}>
                <TopAppBar
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...info.restProps}
                    ref={appBarRef}
                    className={cn(
                        info.restProps.className,
                        styles["dynamic-app-bar__app-bar"]
                    )}
                >
                    <TopAppBarRow>
                        <TopAppBarSection alignStart>
                            {React.isValidElement(info.navIcon) ? (
                                info.navIcon
                            ) : (
                                <TopAppBarNavigationIcon
                                    icon={info.navIcon?.icon}
                                    onClick={info.navIcon?.onNav}
                                />
                            )}
                            <TopAppBarTitle>{info.title}</TopAppBarTitle>
                        </TopAppBarSection>
                        <TopAppBarSection alignEnd>
                            {info.actionItems?.map((item) => (
                                <TopAppBarActionItem
                                    icon={item.icon}
                                    onClick={item.onClick}
                                    key={item.icon}
                                />
                            ))}
                        </TopAppBarSection>
                    </TopAppBarRow>
                </TopAppBar>
            </ThemeProvider>,
            document.querySelector(`#${displayID}`) as Element
        );
    }, [render]);
};
