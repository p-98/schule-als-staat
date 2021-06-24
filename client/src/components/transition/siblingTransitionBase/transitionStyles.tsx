export enum Modes {
    xAxis,
    yAxis,
    zAxis,
    fadeThrough,
}
export const transitionStyleMap: {
    [key in Modes]: {
        get: (
            direction: "next" | "back",
            stage: "start" | "end",
            element: "old" | "new"
        ) => Partial<CSSStyleDeclaration>;
        reset: () => Partial<CSSStyleDeclaration>;
    };
} = {
    [Modes.xAxis]: {
        get: (direction, stage, element) => {
            if (
                (direction === "next" &&
                    stage === "start" &&
                    element === "new") ||
                (direction === "back" && stage === "end" && element === "old")
            )
                return { transform: "translateX(30px)" };

            if (
                (direction === "next" &&
                    stage === "end" &&
                    element === "old") ||
                (direction === "back" && stage === "start" && element === "new")
            )
                return { transform: "translateX(-30px)" };

            return { transform: "translateX(0px)" };
        },
        reset: () => ({
            transform: "",
        }),
    },
    [Modes.yAxis]: {
        get: (direction, stage, element) => {
            if (
                (direction === "next" &&
                    stage === "start" &&
                    element === "new") ||
                (direction === "back" && stage === "end" && element === "old")
            )
                return { transform: "translateY(30px)" };

            if (
                (direction === "next" &&
                    stage === "end" &&
                    element === "old") ||
                (direction === "back" && stage === "start" && element === "new")
            )
                return { transform: "translateY(-30px)" };

            return { transform: "translateY(0px)" };
        },
        reset: () => ({
            transform: "",
        }),
    },
    [Modes.zAxis]: {
        get: (direction, stage, element) => {
            if (
                (direction === "next" &&
                    stage === "start" &&
                    element === "new") ||
                (direction === "back" && stage === "end" && element === "old")
            )
                return { transform: "scale(0.8)" };

            if (
                (direction === "next" &&
                    stage === "end" &&
                    element === "old") ||
                (direction === "back" && stage === "start" && element === "new")
            )
                return { transform: "scale(1.1)" };

            return { transform: "scale(1)" };
        },
        reset: () => ({
            transform: "",
        }),
    },
    [Modes.fadeThrough]: {
        get: (_, stage, element) => {
            if (stage === "start" && element === "new")
                return { transform: "scale(0.8857)" };

            return { transform: "scale(1)" };
        },
        reset: () => ({
            transform: "",
        }),
    },
};
