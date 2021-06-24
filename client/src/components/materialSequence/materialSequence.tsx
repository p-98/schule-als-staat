import Sequence from "Components/sequence/sequence";
import { useState } from "react";

// @rmwc/button dependencies
import "@material/button/dist/mdc.button.css";
import "@rmwc/icon/icon.css";
import "@material/ripple/dist/mdc.ripple.css";
import { Button } from "@rmwc/button";

import styles from "./materialSequence.module.css";

// dot indicator
interface DotIndicatorProps {
    count: number;
    currentIndex: number;
}
const DotIndicator: React.FC<DotIndicatorProps> = ({ count, currentIndex }) => (
    <div className={styles["material-sequence__dot-indicator"]}>
        {Array(count)
            .fill(null)
            .map((_, index) => (
                <div
                    className={[
                        styles["material-sequence__dot"],
                        index === currentIndex
                            ? styles["material-sequence__dot--active"]
                            : "",
                    ].join(" ")}
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                />
            ))}
    </div>
);

// material sequence
export interface MaterialSequenceProps
    extends React.HTMLAttributes<HTMLDivElement> {
    children: React.JSXElementConstructor<{
        className?: string;
    }>[];
    border?: boolean;
}
const MaterialSequence: React.FC<MaterialSequenceProps> = ({
    children,
    className,
    border,
    ...props
}) => {
    const [visibleElement, setVisibleElement] = useState(0);

    const back = (): void => {
        if (visibleElement === 0) return;

        setVisibleElement(visibleElement - 1);
    };
    const next = (): void => {
        if (visibleElement === children.length - 1) return;

        setVisibleElement(visibleElement + 1);
    };

    return (
        <div
            {...props}
            className={[className, styles["material-sequence"]].join(" ")}
        >
            <Sequence visibleElement={visibleElement}>{children}</Sequence>
            <div
                className={[
                    styles["material-sequence__controller"],
                    border
                        ? styles["material-sequence__controller--border"]
                        : "",
                ].join(" ")}
            >
                <Button
                    label="zurück"
                    icon="navigate_before"
                    onClick={back}
                    className={styles["material-sequence__button"]}
                />
                <DotIndicator
                    count={children.length}
                    currentIndex={visibleElement}
                />
                <Button
                    label="weiter"
                    trailingIcon="navigate_next"
                    onClick={next}
                    className={styles["material-sequence__button"]}
                />
            </div>
        </div>
    );
};
export default MaterialSequence;
