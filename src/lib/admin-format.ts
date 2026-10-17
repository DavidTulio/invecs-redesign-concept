const dateTime = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  dateStyle: "medium",
  timeStyle: "short",
});
const dateOnly = new Intl.DateTimeFormat("en-PH", { timeZone: "Asia/Manila", dateStyle: "medium" });

/** "16 Oct 2026, 11:24 pm" in Philippine time. */
export const formatDateTime = (iso: string) => dateTime.format(new Date(iso));

/** A YYYY-MM-DD date (no time zone) as "20 Oct 2026". */
export const formatDay = (day: string) => dateOnly.format(new Date(`${day}T12:00:00+08:00`));

/** The moment `days` days ago, as an ISO string for database comparisons. */
export const daysAgoIso = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();
