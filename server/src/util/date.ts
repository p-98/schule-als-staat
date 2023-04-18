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
