import { useState } from "react";
import cn from "classnames";
import {
    Modes,
    SiblingTransitionBase,
    ISiblingTransitionBaseElementProps,
} from "Components/transition/siblingTransitionBase/siblingTransitionBase";

// @rmwc/button dependencies
import "@material/button/dist/mdc.button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";
import { Button } from "@rmwc/button";

import styles from "./materialSequence.module.css";

export { SiblingTransitionBaseElement as MaterialSequenceElement } from "Components/transition/siblingTransitionBase/siblingTransitionBase";

// dot indicator
interface IDotIndicatorProps {
    count: number;
    currentIndex: number;
}
const DotIndicator: React.FC<IDotIndicatorProps> = ({
    count,
    currentIndex,
}) => (
    <div className={styles["material-sequence__dot-indicator"]}>
        {Array(count)
            .fill(null)
            .map((_, index) => (
                <div
                    className={cn(
                        styles["material-sequence__dot"],
                        index === currentIndex
                            ? styles["material-sequence__dot--active"]
                            : ""
                    )}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                />
            ))}
    </div>
);

// material sequence
export interface IMaterialSequenceProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactElement<ISiblingTransitionBaseElementProps>[];
    border?: boolean;
}
export const MaterialSequence: React.FC<IMaterialSequenceProps> = ({
    children,
    className,
    border,
    ...restProps
}) => {
    const [activeElement, setActiveElement] = useState(0);

    const back = (): void => {
        if (activeElement === 0) return;

        setActiveElement(activeElement - 1);
    };
    const next = (): void => {
        if (activeElement === children.length - 1) return;

        setActiveElement(activeElement + 1);
    };

    return (
        <div
            {...restProps}
            className={cn(className, styles["material-sequence"])}
        >
            <SiblingTransitionBase
                mode={Modes.xAxis}
                activeElement={activeElement}
            >
                {children}
            </SiblingTransitionBase>
            <div
                className={cn(
                    styles["material-sequence__controller"],
                    border
                        ? styles["material-sequence__controller--border"]
                        : ""
                )}
            >
                <Button
                    label="zurück"
                    icon="navigate_before"
                    onClick={back}
                    className={styles["material-sequence__button"]}
                    disabled={activeElement === 0}
                />
                <DotIndicator
                    count={children.length}
                    currentIndex={activeElement}
                />
                <Button
                    label="weiter"
                    trailingIcon="navigate_next"
                    onClick={next}
                    className={styles["material-sequence__button"]}
                    disabled={activeElement === children.length - 1}
                />
            </div>
        </div>
    );
};
