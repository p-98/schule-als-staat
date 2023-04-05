import { IUserSignature } from "Types/models";

export function safeParseInt(string: string, radix: number): number {
    const number = parseInt(string, radix);

    if (Number.isNaN(number))
        throw new Error("String to number conversion failed.");

    return number;
}

export async function fileToBase64(file: File): Promise<string> {
    const arrayBuffer = await file.arrayBuffer();
    return Buffer.from(arrayBuffer).toString("base64");
}

/** safely stringifies user signatures */
export function stringifyUserSignature({ type, id }: IUserSignature): string {
    // using object destructuring and creating a new object to prevent additional properties from appearing in JSON result
    return JSON.stringify({ type, id });
}

export function parseUserSignature(json: string): IUserSignature {
    const parsed = JSON.parse(json) as unknown;

    if (process.env.NODE_ENV === "production") return parsed as IUserSignature;

    if (
        typeof parsed === "object" &&
        parsed !== null &&
        typeof (parsed as { id?: unknown }).id === "string" &&
        typeof (parsed as { type?: unknown }).type === "string"
    ) {
        return parsed as IUserSignature;
    }

    throw new Error(`Given json string is not a user signature: ${json}`);
}

type TStringFromType<T> = T extends string
    ? "string"
    : T extends number
    ? "number"
    : never;
function parseArray<Of extends string | number>(
    of: TStringFromType<Of>,
    json: string
): Of[] {
    const parsed = JSON.parse(json) as unknown;

    // skip type checks in production
    if (process.env.NODE_ENV === "production") return parsed as Of[];

    if (
        Array.isArray(parsed) &&
        parsed.length > 0 &&
        // check if every value in the array is of correct type
        parsed.reduce<boolean>((prev, curr) => prev && typeof curr === of, true)
    )
        return parsed as Of[];

    throw new Error(`Given json string is not an array of ${of}s: ${json}`);
}

export enum EUserTypeTableMap {
    COMPANY = "companies",
    CITIZEN = "citizens",
    GUEST = "guests",
}

export function stringifyVoteVote(vote: number[]): string {
    return JSON.stringify(vote);
}
export function parseVoteVote(json: string): number[] {
    return parseArray("number", json);
}

export function stringifyVoteChoices(choices: string[]): string {
    return JSON.stringify(choices);
}
export function parseVoteChoices(json: string): string[] {
    return parseArray("string", json);
}

export function stringifyVoteResult(result: number[]): string {
    return JSON.stringify(result);
}
export function parseVoteResult(json: string): number[] {
    return parseArray("number", json);
}
