import { useState } from "react";

type TUsePredictionObserverReturn = [
    boolean,
    {
        onMouseEnter: React.HTMLAttributes<HTMLElement>["onMouseEnter"];
        onMouseLeave: React.HTMLAttributes<HTMLElement>["onMouseLeave"];
        onTouchStart: React.HTMLAttributes<HTMLElement>["onTouchStart"];
        onTouchEnd: React.HTMLAttributes<HTMLElement>["onTouchEnd"];
    }
];

// TODO: check touch functionality (hover might be triggered after touch is released)
/** Detects whether an element is expected to be interacted with */
const usePredictionObserver = (): TUsePredictionObserverReturn => {
    const [hover, setHover] = useState(false);
    const [touch, setTouch] = useState(false);

    const expectInteraction = hover || touch;

    return [
        expectInteraction,
        {
            onMouseEnter: () => {
                // prevent default browser behaviour to simulate mouse
                if (touch) return;
                console.log("mouse over");
                setHover(true);
            },
            onMouseLeave: () => {
                console.log("mouse out");
                setHover(false);
            },

            onTouchStart: () => {
                console.log("touch start");
                setTouch(true);
            },
            onTouchEnd: () =>
                requestAnimationFrame(() =>
                    requestAnimationFrame(() => {
                        console.log("touch end");
                        setTouch(false);
                    })
                ),
        },
    ];
};
export default usePredictionObserver;
