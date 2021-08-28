/* Enables live changing elements, as they can be freshly resolved on every action */
type HTMLElementCallback = HTMLElement | (() => HTMLElement);
function resolveHTMLElementCallback(element: HTMLElementCallback): HTMLElement {
    if (typeof element === "function") return element();

    return element;
}

/**
 * Class for switching between several HTMLElements.
 * Assumes that all Elements are valid and will not check them
 */
export default class ElementSwitcher {
    /** used to preserve the display property of each html element */
    displayModeList: { elementDOM: HTMLElement; displayMode: string }[] = [];

    constructor(
        public elementMap: { [key: string]: HTMLElementCallback },
        public activeElement: string,
        public readonly options: { mode: "display" | "visibility" } = {
            mode: "display",
        }
    ) {
        if (!(activeElement in elementMap))
            throw Error("activeElement must be a key of elementMap");

        // set initial styles
        this.setAllStyles();
    }

    /* eslint-disable no-return-assign, no-param-reassign */
    protected modeMap = {
        display: {
            activate: (element: HTMLElement): string => {
                const cachedDisplayMode = this.displayModeList.find(
                    (entry) => entry.elementDOM === element
                )?.displayMode;

                return (element.style.display = cachedDisplayMode ?? "block");
            },
            deactivate: (element: HTMLElement): string =>
                (element.style.display = "none"),
        },
        visibility: {
            activate: (element: HTMLElement): string =>
                (element.style.visibility = "visible"),
            deactivate: (element: HTMLElement): string =>
                (element.style.visibility = "hidden"),
        },
    };
    /* eslint-enable no-return-assign, no-param-reassign */

    detectDisplayMode(elementDOM: HTMLElement): void {
        // dont update if mode is already known.
        // (Also prevents detecting all elements as "none" when setAllStyles is called multiple times)
        const cacheIndex = this.displayModeList.findIndex(
            (entry) => entry.elementDOM === elementDOM
        );
        if (cacheIndex !== -1) return;

        // detect and cache display mode
        let displayMode = getComputedStyle(elementDOM).display;

        if (displayMode === "none") displayMode = "block";

        this.displayModeList.push({ elementDOM, displayMode });
    }

    /**
     * Must be called when the elements used are updated
     */
    setAllStyles(): void {
        Object.keys(this.elementMap).forEach((elementKey) => {
            const element = this.elementMap[elementKey];
            if (!element) return; // only for linting

            const elementDOM = resolveHTMLElementCallback(element);

            this.detectDisplayMode(elementDOM);

            // apply styles
            if (elementKey === this.activeElement)
                return this.modeMap[this.options.mode].activate(elementDOM);

            this.modeMap[this.options.mode].deactivate(elementDOM);
        });
    }

    getActiveElementDOM(elementKey?: string): HTMLElement {
        // return active element by default
        const elementMapKey = elementKey ?? this.activeElement;

        const element = this.elementMap[elementMapKey];
        if (!element) throw Error("elementKey must be a key of elementMap");

        return resolveHTMLElementCallback(element);
    }

    switchTo(newActiveElement: string): void {
        if (!(newActiveElement in this.elementMap)) {
            throw Error("activeElement must be a key of elementMap");
        }

        this.modeMap[this.options.mode].deactivate(
            resolveHTMLElementCallback(
                this.elementMap[this.activeElement] as HTMLElementCallback
            )
        );

        // change active element
        this.activeElement = newActiveElement;

        this.modeMap[this.options.mode].activate(
            resolveHTMLElementCallback(
                this.elementMap[this.activeElement] as HTMLElementCallback
            )
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
