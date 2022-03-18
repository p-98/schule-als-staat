export function placeholderify<T, P>(
    arr: T[],
    segmentLength: number,
    placeholderFactory: () => P
): (T | P)[] {
    if (arr.length <= segmentLength) return [placeholderFactory(), ...arr];

    return [
        placeholderFactory(),
        ...arr.slice(0, segmentLength),
        placeholderFactory(),
        ...placeholderify(
            arr.slice(segmentLength),
            segmentLength,
            placeholderFactory
        ),
    ];
}
