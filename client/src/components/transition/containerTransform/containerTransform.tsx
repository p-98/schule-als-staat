import React, {
    CSSProperties,
    forwardRef,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import cn from "classnames";

// local
import { initRefsFactory } from "Utility/initRefs";
import { clearDimensions, getDimensions, setDimensions } from "../util/domUtil";
import ElementSwitcher from "../util/elementSwitcher";

import styles from "./*containerTransform.module.css";

/*
usage:
    <ContainerTransform>
        <ContainerTransformElement/>
        <ContainerTransformElement/>
        <ContainerTransformElement/>
    </ContainerTransform>
*/

interface IContainerTransformProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactElement<IContainerTransformElementProps>[];
    activeElement: string;
    onTransformFinish?: (
        activeElement: string,
        activeElementDOM: HTMLElement
    ) => void;
    transitionTime?: number;
}

export const ContainerTransform = forwardRef<
    HTMLDivElement,
    IContainerTransformProps
>(
    (
        {
            children,
            activeElement: activeElementTarget,
            onTransformFinish,
            transitionTime = 300,
            ...restProps
        },
        refProp
    ) => {
        const containerRef = useRef<HTMLDivElement>();
        const [inTransition, setInTransition] = useState(false);
        const [activeElement, setActiveElement] = useState(activeElementTarget);
        const [elementSwitcher, setElementSwitcher] = useState<
            undefined | ElementSwitcher
        >(undefined);

        // init ElementSwitcher
        useEffect(() => {
            const elementMap = children.reduce(
                (map: Record<string, HTMLElement>, element) => {
                    const { elementKey } = element.props;
                    const elementDOM = containerRef.current?.querySelector(
                        `[data-element-key=${elementKey}]`
                    ) as HTMLElement;

                    // eslint-disable-next-line no-param-reassign
                    map[elementKey] = elementDOM;

                    return map;
                },
                {}
            );

            setElementSwitcher(new ElementSwitcher(elementMap, activeElement));

            return () => setElementSwitcher(undefined);
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []);

        // element switching logic
        useEffect(() => {
            if (inTransition) return;
            if (activeElementTarget === activeElement) return;
            if (!containerRef.current) return;
            if (!elementSwitcher) return;

            setInTransition(true);

            const containerDOM = containerRef.current;
            const fadingWrapperDOM = containerDOM.querySelector(
                `.${styles["container-transform__fading-wrapper"] as string}`
            ) as HTMLElement;

            // fix container dimensions
            setDimensions(containerDOM, getDimensions(containerDOM));

            // set new dimensions
            const targetDimensions = elementSwitcher.flash(
                activeElementTarget,
                (activeElementTargetDOM) =>
                    getDimensions(activeElementTargetDOM)
            );

            requestAnimationFrame(() => {
                setDimensions(containerDOM, targetDimensions);

                // start fading
                fadingWrapperDOM.style.animationName = styles[
                    "container-transform__fade"
                ] as string;
            });

            // switch elements
            setTimeout(() => {
                elementSwitcher.switchTo(activeElementTarget);
            }, 0.3 * transitionTime);

            // finish & cleanup
            setTimeout(() => {
                fadingWrapperDOM.style.animationName = "";
                clearDimensions(containerDOM);

                onTransformFinish?.(
                    activeElementTarget,
                    elementSwitcher.getActiveElementDOM(activeElementTarget)
                );

                setActiveElement(activeElementTarget);
                setInTransition(false);
            }, transitionTime);
        }, [
            activeElement,
            activeElementTarget,
            elementSwitcher,
            inTransition,
            onTransformFinish,
            transitionTime,
        ]);

        return useMemo(
            () => (
                <div
                    {...restProps}
                    className={cn(
                        restProps.className,
                        styles["container-transform"]
                    )}
                    style={
                        {
                            "--transition-time": `${transitionTime}ms`,
                        } as CSSProperties
                    }
                    ref={initRefsFactory(refProp, containerRef)}
                >
                    <div
                        className={
                            styles["container-transform__fading-wrapper"]
                        }
                    >
                        {children}
                    </div>
                </div>
            ),
            [children, refProp, restProps, transitionTime]
        );
    }
);

interface IContainerTransformElementProps {
    children: React.ReactElement<React.HTMLAttributes<HTMLElement>>;
    elementKey: string;
}

export const ContainerTransformElement: React.FC<
    IContainerTransformElementProps
> = ({ children, elementKey }: IContainerTransformElementProps) =>
    React.cloneElement(children, {
        className: cn(
            children.props.className,
            styles["container-transform__element"]
        ),
        "data-element-key": elementKey,
    } as Partial<React.HTMLAttributes<HTMLElement>>);
