/** Returns Date constructed of date and time
 *
 * @param date date compliant to RFC 3339 Section 5.6 full-date (e.g. 2023-04-07)
 * @param time time compliant to RFC 3339 Section 5.6 full-time (e.g. 11:09:34:829+02:00)
 * @returns
 */
export const parseDateAndTime = (date: string, time: string): Date =>
    new Date(`${date}T${time}`);

export const toISOString = (date: Date): string => date.toISOString();
