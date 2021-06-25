export interface IDimensions {
    height: number;
    width: number;
}
export function getDimensions(domElement: HTMLElement): IDimensions {
    return {
        height: domElement.offsetHeight,
        width: domElement.offsetWidth,
    };
}
export function setDimensions(
    domElement: HTMLElement,
    dimensions: IDimensions
): void {
    /* eslint-disable no-param-reassign */
    domElement.style.height = `${dimensions.height}px`;
    domElement.style.width = `${dimensions.width}px`;
    /* eslint-enable no-param-reassign */
}
export function clearDimensions(domElement: HTMLElement): void {
    /* eslint-disable no-param-reassign */
    domElement.style.height = "";
    domElement.style.width = "";
    /* eslint-enable no-param-reassign */
}

interface IOffset {
    top: number;
    left: number;
}
export function getOffset(domElement: HTMLElement): IOffset {
    const clientRect = domElement.getBoundingClientRect();
    return {
        top: clientRect.top,
        left: clientRect.left,
    };
}
export function setOffset(domElement: HTMLElement, offset: IOffset): void {
    const parentClientRect = (domElement.parentElement as HTMLElement).getBoundingClientRect();
    /* eslint-disable no-param-reassign */
    domElement.style.top = `${offset.top - parentClientRect.top}px`;
    domElement.style.left = `${offset.left - parentClientRect.left}px`;
    /* eslint-enable no-param-reassign */
}
export function clearOffset(domElement: HTMLElement): void {
    /* eslint-disable no-param-reassign */
    domElement.style.top = "";
    domElement.style.left = "";
    /* eslint-enable no-param-reassign */
}
