import { useEffect, useLayoutEffect, useRef, useState } from "react";

import styles from "./transitionHeight.module.css";

const animationTime = 500;

interface TransitionHeightProps {
    children: React.JSXElementConstructor<{
        setVisibleElement: React.Dispatch<React.SetStateAction<number>>;
    }>[];
}
export const TransitionHeight: React.FC<TransitionHeightProps> = ({
    children,
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleElement, setVisibleElement] = useState(0);
    const [visibleElementTarget, setVisibleElementTarget] = useState(0);

    // render only correct element
    useLayoutEffect(() => {
        if (!containerRef.current) return;

        const childrenArray = Array.from(
            containerRef.current.children
        ) as HTMLElement[];

        childrenArray.forEach((childDOM, index) => {
            // eslint-disable-next-line no-param-reassign
            childDOM.style.display = index === visibleElement ? "" : "none";
        });
    }, [children, visibleElement]);

    // handles change of visibleElementTarget
    useLayoutEffect(() => {
        if (visibleElementTarget === visibleElement) return;

        const containerDOM = containerRef.current;
        if (!containerDOM) return;

        const childrenArray = Array.from(
            containerDOM.children
        ) as HTMLElement[];

        const oldDOM = childrenArray[visibleElement] as HTMLElement;
        const newDOM = childrenArray[visibleElementTarget] as HTMLElement;

        containerDOM.style.height = `${oldDOM.scrollHeight}px`;

        oldDOM.style.display = "none";
        newDOM.style.display = "";

        containerDOM.style.height = `${newDOM.scrollHeight}px`;

        oldDOM.style.display = "";
        newDOM.style.display = "none";

        containerDOM.style.animation = `${
            styles["transition-height-fade"] as string
        } ${animationTime / 1000}s cubic-bezier(0.4, 0, 0.2, 1)`;

        // at peak velocity
        setTimeout(() => {
            setVisibleElement(visibleElementTarget);
        }, animationTime * 0.3);

        // at the end
        containerDOM.addEventListener("transitionend", () => {
            containerDOM.style.animation = "";
            containerDOM.style.height = "";
        });
    }, [visibleElementTarget, visibleElement]);

    return (
        <div ref={containerRef} className={styles["transition-height"]}>
            {children.map((Child, index) => (
                <Child
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    setVisibleElement={setVisibleElementTarget}
                />
            ))}
        </div>
    );
};

export const SSRTransitionHeight: React.FC<TransitionHeightProps> = (props) => {
    const [renderComponent, setRenderComponent] = useState(false);

    useEffect(() => {
        setRenderComponent(true);
    }, []);

    if (!renderComponent) return null;

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <TransitionHeight {...props} />;
};
