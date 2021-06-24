import { useEffect, useRef, useState } from "react";
import styles from "./sequence.module.css";

interface SequenceProps extends React.HTMLAttributes<HTMLDivElement> {
    visibleElement: number;
    children: React.JSXElementConstructor<{
        className?: string;
    }>[];
}
const Sequence: React.FC<SequenceProps> = ({
    className,
    children,
    visibleElement: visibleElementTarget,
    ...props
}) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleElement, setVisibleElement] = useState(visibleElementTarget);
    const [inTransition, setInTransition] = useState(false);

    // inititalize state of first rendered element
    useEffect(() => {
        if (!containerRef.current) return;

        const childrenArr = Array.from(
            containerRef.current.children
        ) as HTMLElement[];

        // adjust right, so every element is at the same position
        childrenArr.forEach((childDOM, index) => {
            // eslint-disable-next-line no-param-reassign
            childDOM.style.right = `${index * 100}%`;
        });

        // set the first element to be visible
        const childDOM = childrenArr[visibleElement];
        if (!childDOM) return;

        childDOM.style.visibility = "visible";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!containerRef.current) return;
        if (visibleElement === visibleElementTarget) return;

        if (inTransition) return;
        setInTransition(true);

        const childrenArr = Array.from(
            containerRef.current.children
        ) as HTMLElement[];

        const oldDOM = childrenArr[visibleElement];
        const newDOM = childrenArr[visibleElementTarget];
        if (!(oldDOM && newDOM)) return;

        newDOM.style.visibility = "visible";

        // apply the animation
        oldDOM.style.animationName = styles[
            `sequence__fade-${
                visibleElementTarget > visibleElement ? "ctl" : "ctr"
            }`
        ] as string;
        newDOM.style.animationName = styles[
            `sequence__fade-${
                visibleElementTarget > visibleElement ? "rtc" : "ltc"
            }`
        ] as string;

        const handleAnimationEnd = (): void => {
            oldDOM.removeEventListener("animationend", handleAnimationEnd);

            oldDOM.style.visibility = "";
            oldDOM.style.animation = "";

            setVisibleElement(visibleElementTarget);
            setInTransition(false);
        };
        oldDOM.addEventListener("animationend", handleAnimationEnd);
    }, [visibleElement, visibleElementTarget, inTransition]);

    return (
        <div
            {...props}
            className={[className, styles["sequence"]].join(" ")}
            ref={containerRef}
        >
            {children.map((Child, index) => (
                <Child
                    className={styles["sequence__element"]}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                />
            ))}
        </div>
    );
};
export default Sequence;
