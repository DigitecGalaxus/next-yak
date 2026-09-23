/**
 * One format for a post's date, on the index and on the post. `date` is an ISO date with
 * no time zone, so it is parsed as UTC and printed as UTC. Parsed as local time, a date
 * would read one day early for every reader west of Greenwich.
 */
export function formatPostDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
