export interface IProduct {
    id: string;
    name: string;
    price: number;
}

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

export const pickRandom = <T>(arr: T[]): T =>
    arr[Math.floor(Math.random() * arr.length)] as T;
