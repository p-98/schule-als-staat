export function repeatArr<T>(arr: T[], times: number): T[] {
    if (times === 1) return arr;

    return arr.concat(repeatArr(arr, times - 1));
}

export function reassignIDs<T extends { id: string }>(arr: T[]): T[] {
    return arr.map((transaction, index) => ({
        ...transaction,
        id: index.toString(),
    }));
}
