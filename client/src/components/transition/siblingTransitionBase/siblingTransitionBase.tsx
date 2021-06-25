import React, { useEffect, useMemo, useRef, useState } from "react";
import cn from "classnames";
import ElementSwitcher from "../util/elementSwitcher";
import { transitionStyleMap, Modes } from "./transitionStyles";
import { useChildren, TChildren } from "./children";

import styles from "./siblingTransitionBase.module.css";

export * from "./children";
export { Modes } from "./transitionStyles";

const transitionTime = 300;

export interface ISiblingTransitionBaseProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: TChildren;
    activeElement: number;
    mode: Modes;
}
export const SiblingTransitionBase: React.FC<ISiblingTransitionBaseProps> = ({
    children,
    activeElement: activeElementTarget,
    mode,
    ...restProps
}: ISiblingTransitionBaseProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const [inTransition, setInTransition] = useState(false);
    const [activeElement, setActiveElement] = useState(activeElementTarget);
    const [elementSwitcher, setElementSwitcher] = useState<
        undefined | ElementSwitcher
    >(undefined);

    const checkedChildren = useChildren(children);

    // init effect
    useEffect(() => {
        const childrenArray = Array.from(
            containerRef.current?.children as HTMLCollection
        ) as HTMLElement[];

        // init elementSwitcher
        const elementMap = children.reduce(
            (map: Record<number, HTMLElement>, child) => {
                const { index } = child.props;

                // eslint-disable-next-line no-param-reassign
                map[index] = childrenArray.find(
                    (childElement) =>
                        childElement.dataset.elementIndex === index.toString()
                ) as HTMLElement;

                return map;
            },
            {}
        );

        // set initial offsets
        childrenArray.forEach((element, index) => {
            // eslint-disable-next-line no-param-reassign
            element.style.right = `${index * 100}%`;
        });

        setElementSwitcher(
            new ElementSwitcher(elementMap, activeElement.toString(), {
                mode: "visibility",
            })
        );

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

        const oldDOM = elementSwitcher.getActiveElementDOM();
        const newDOM = elementSwitcher.getActiveElementDOM(
            activeElementTarget.toString()
        );

        const direction = activeElementTarget > activeElement ? "next" : "back";

        // disable transitions
        containerDOM.classList.add(
            styles["sibling-transition-base--no-transition"] as string
        );

        // apply init styles
        Object.assign(
            oldDOM.style,
            transitionStyleMap[mode].get(direction, "start", "old")
        );
        Object.assign(
            newDOM.style,
            transitionStyleMap[mode].get(direction, "start", "new")
        );

        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                // enable transitions
                containerDOM.classList.remove(
                    styles["sibling-transition-base--no-transition"] as string
                );

                // start transition
                Object.assign(
                    oldDOM.style,
                    transitionStyleMap[mode].get(direction, "end", "old")
                );
                Object.assign(
                    newDOM.style,
                    transitionStyleMap[mode].get(direction, "end", "new")
                );

                // start fading
                containerDOM.style.animationName = styles[
                    "sibling-transition-base__container-fade"
                ] as string;

                // switch elements
                setTimeout(() => {
                    if (!elementSwitcher) return;
                    elementSwitcher.switchTo(activeElementTarget.toString());
                }, transitionTime * 0.3);

                // finish and cleanup
                setTimeout(() => {
                    Object.assign(
                        oldDOM.style,
                        transitionStyleMap[mode].reset()
                    );
                    Object.assign(
                        newDOM.style,
                        transitionStyleMap[mode].reset()
                    );
                    containerDOM.style.animationName = "";

                    setActiveElement(activeElementTarget);
                    setInTransition(false);
                }, transitionTime);
            })
        );
    }, [
        inTransition,
        activeElementTarget,
        activeElement,
        elementSwitcher,
        mode,
    ]);

    return useMemo(
        () => (
            <div
                className={cn(
                    styles["sibling-transition-base"],
                    restProps.className
                )}
                {...restProps}
                ref={containerRef}
            >
                {checkedChildren}
            </div>
        ),
        [checkedChildren, restProps]
    );
};
