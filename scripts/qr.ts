import { chunk, padCharsStart, padStart, parseInt, pipe, toString } from "lodash/fp";

type BitArray = number[];
type Version = "M1" | "M2" | "M3" | "M4";
type Mode = "numeric" | "alphanumeric" | "byte";

const strToBa = (str: string): BitArray => str.split("").map(parseInt(2));

const modeIndicator: Partial<Record<`${Version} ${Mode}`, BitArray>> = {
    "M1 numeric": strToBa(""),
    "M2 numeric": strToBa("0"),
    "M2 alphanumeric": strToBa("1"),
    "M3 numeric": strToBa("00"),
    "M3 alphanumeric": strToBa("01"),
    "M3 byte": strToBa("10"),
    "M4 numeric": strToBa("000"),
    "M4 alphanumeric": strToBa("001"),
    "M4 byte": strToBa("010"),
};
const characterCountIndicatorBits: Partial<
    Record<`${Version} ${Mode}`, number>
> = {
    "M1 numeric": 3,
    "M2 numeric": 4,
    "M2 alphanumeric": 3,
    "M3 numeric": 5,
    "M3 alphanumeric": 4,
    "M3 byte": 4,
    "M4 numeric": 6,
    "M4 alphanumeric": 5,
    "M4 byte": 5,
};
const characterCountIndicator = (version: Version, mode: Mode) =>
    pipe(
        (_: number) => _.toString(2),
        padCharsStart("*", characterCountIndicatorBits[`${version} ${mode}`]!),
        strToBa
    );
const group: Record<Mode, number> = {
    numeric: 3,
    alphanumeric: 2,
    byte: 1,
};
const encodeBlock: Record<Mode, (_: string) => string> = {
    numeric: pipe(chunk(3), map(pipe()))
}
const base: Record<Mode, number> = {
    numeric: 10,
    alphanumeric: 45,
    byte: 256,
};
const terminator: Record<Version, BitArray> = {
    M1: strToBa("000"),
    M2: strToBa("00000"),
    M3: strToBa("0000000"),
    M4: strToBa("000000000"),
};

const encodeSequence = ()

console.log(modeIndicator["M4 byte"]);

const encode = (input: Buffer, version: Version, mode: Mode) => {};
