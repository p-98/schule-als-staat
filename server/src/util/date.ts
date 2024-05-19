import { type Config } from "Root/types/config";
import { filter, map, negate, pipe, zip } from "lodash/fp";
import { eachHourOfInterval, endOfHour, isEqual } from "date-fns/fp";

/** Returns Date constructed of date and time
 *
 * @param date date compliant to RFC 3339 Section 5.6 full-date (e.g. 2023-04-07)
 * @param time time compliant to RFC 3339 Section 5.6 full-time (e.g. 11:09:34:829+02:00)
 * @returns
 */
export const parseDateAndTime = (date: string, time: string): Date =>
    new Date(`${date}T${time}`);

/** Formats `date` as RFC3339 "date-time" string in UTC
 *
 * @param date date to format
 * @returns string of form "YYYY-MM-DDThh:mm.ss.sssZ"
 */
export const formatDateTimeZ = (date: Date): string => date.toISOString();
/** Formats `date` as RFC3339 "full-date" string in UTC
 *
 * @param date date to format
 * @returns string of form "YYYY-MM-DD"
 */
export const formatDateZ = (date: Date): string =>
    date.toISOString().slice(0, 10);
/** Formats `date` as RFC3339 "full-time" string in UTC
 *
 * @param date date to format
 * @returns string of form "mm.ss.sssZ"
 */
export const formatTimeZ = (date: Date): string => date.toISOString().slice(11);

/** For a given day, returns the array of start and end of hours the state is open */
export function openingHours(config: Config, date: string): [string, string][] {
    const openInterval = {
        start: parseDateAndTime(date, config.openingHours.open),
        end: parseDateAndTime(date, config.openingHours.close),
    };
    const startOfHours = pipe(
        eachHourOfInterval,
        filter<Date>(negate(isEqual(openInterval.end)))
    )(openInterval);
    const hoursStartEnd = zip(
        map(formatDateTimeZ, startOfHours),
        map(pipe(endOfHour, formatDateTimeZ), startOfHours)
    ) as [string, string][];
    return hoursStartEnd;
}
