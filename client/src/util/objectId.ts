/* eslint-disable @typescript-eslint/ban-types */
let currentId = 0;
const map = new WeakMap<object, number>();

export function id(object: object): string {
    if (!map.has(object)) {
        currentId += 1;
        map.set(object, currentId);
    }

    return (map.get(object) as number).toString();
}
