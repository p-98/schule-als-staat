import { SSRTransitionHeight as TransitionHeight } from "Components/transitionHeight/transitionHeight";
import ElementSwitcher from "Components/transition/util/elementSwitcher";
import { useEffect } from "react";

const Comp1: React.FC<{
    setVisibleElement: (newVisisbleElement: number) => void;
}> = ({ setVisibleElement }) => (
    <div>
        dfgsglh lhdfglsukdjhg ö sdf
        <button onClick={() => setVisibleElement(1)} type="button">
            change
        </button>
    </div>
);
const Comp2: React.FC<{
    setVisibleElement: (newVisisbleElement: number) => void;
}> = ({ setVisibleElement }) => (
    <div>
        dfgsglh lhdfglsukdjhg ö sdf lkjhf lgkjahd glhj lha sföih alslfkh jlkufhj
        skjlfh dkhjyg, flsuydfhjlkh. jsföyhksfjlydgjhly j
        <button onClick={() => setVisibleElement(0)} type="button">
            change
        </button>
    </div>
);

// const TransitionHeightTest: React.FC<Record<string, never>> = () => (
//     <section
//         style={{
//             width: "200px",
//             border: "1px solid lightgray",
//             borderRadius: "16px",
//             padding: "8px",
//         }}
//     >
//         <TransitionHeight>{[Comp1, Comp2]}</TransitionHeight>
//     </section>
// );
const TransitionHeightTest: React.FC<Record<string, never>> = () => {
    useEffect(() => {
        const es = new ElementSwitcher(
            { test: document.documentElement },
            "test"
        );
    });

    return (
        <section
            style={{
                width: "200px",
                border: "1px solid lightgray",
                borderRadius: "16px",
                padding: "8px",
            }}
        >
            <TransitionHeight>{[Comp1, Comp2]}</TransitionHeight>
        </section>
    );
};
export default TransitionHeightTest;
