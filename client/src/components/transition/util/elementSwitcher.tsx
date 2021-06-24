/* eslint-disable no-return-assign, no-param-reassign */
const modeMap = {
    display: {
        activate: (element: HTMLElement) => (element.style.display = "block"),
        deactivate: (element: HTMLElement) => (element.style.display = "none"),
    },
    visibility: {
        activate: (element: HTMLElement) =>
            (element.style.visibility = "visible"),
        deactivate: (element: HTMLElement) =>
            (element.style.visibility = "hidden"),
    },
};
/* eslint-enable no-return-assign, no-param-reassign */

/**
 * Class for switching between several HTMLElements.
 * Assumes that all Elements are valid and will not check them
 */
export default class ElementSwitcher {
    constructor(
        public elementMap: { [key: string]: HTMLElement },
        public activeElement: string,
        public readonly options: { mode: keyof typeof modeMap } = {
            mode: "display",
        }
    ) {
        console.log(elementMap);
        if (!(activeElement in elementMap))
            throw Error("activeElement must be a key of elementMap");

        Object.keys(elementMap).forEach((elementKey) => {
            const element = elementMap[elementKey] as HTMLElement;

            if (elementKey === activeElement)
                return modeMap[this.options.mode].activate(element);

            modeMap[this.options.mode].deactivate(element);
        });
    }

    getActiveElementDOM(element?: string): HTMLElement {
        if (element === undefined)
            return this.elementMap[this.activeElement] as HTMLElement;

        return this.elementMap[element] as HTMLElement;
    }

    switchTo(newActiveElement: string): void {
        if (!(newActiveElement in this.elementMap)) {
            throw Error("activeElement must be a key of elementMap");
        }

        modeMap[this.options.mode].deactivate(
            this.elementMap[this.activeElement] as HTMLElement
        );
        this.activeElement = newActiveElement;
        modeMap[this.options.mode].activate(
            this.elementMap[this.activeElement] as HTMLElement
        );
    }

    flash<ReturnType>(
        newActiveElement: string,
        callback: (newActiveElementDOM: HTMLElement) => ReturnType
    ): ReturnType {
        const oldActiveElement = this.activeElement;

        this.switchTo(newActiveElement);
        const callbackReturn = callback(this.getActiveElementDOM());
        this.switchTo(oldActiveElement);

        return callbackReturn;
    }
}
