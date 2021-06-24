import React from "react";

interface HOCProps {
    modules: React.ForwardRefExoticComponent<
        HOCChildProps & React.RefAttributes<HTMLElement>
    >[];
}
interface HOCChildProps {
    setVisibleElement: (elementIndex: number) => void;
}
declare const HOC: React.FC<HOCProps>;

// this produces an error in HOCTest if HTMLDivElement is used
// and an error in HOCChildTest if HTMLElement is used
// as the ref type in React.forwardRef
const HOCChildTest = React.forwardRef<HTMLDivElement, HOCChildProps>(
    ({ setVisibleElement }, ref) => (
        <div ref={ref}>
            some text
            <button type="button" onClick={() => setVisibleElement(0)}>
                click me
            </button>
        </div>
    )
);
const HOCTest: React.FC = () => <HOC modules={[HOCChildTest]} />;
export default HOCTest;

// this assignment fails
declare let divTest: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLDivElement>
>;

declare let htmlTest: React.ForwardRefExoticComponent<
    React.RefAttributes<HTMLElement>
>;

htmlTest = divTest;
