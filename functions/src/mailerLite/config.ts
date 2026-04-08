/** Default “All Users” group; override with param `MAILERLITE_ALL_USERS_GROUP_ID` if needed. */
export const DEFAULT_ALL_USERS_GROUP_ID = "183717659168212275";

/** Legacy placeholder — still rejected by upsert guard so misconfiguration fails loudly. */
export const INVALID_GROUP_ID_SENTINEL = "YOUR_ALL_USERS_GROUP_ID";

/**
 * Custom field keys in MailerLite (must match field names / API keys in the dashboard).
 * See https://developers.mailerlite.com/docs/subscribers.html#fields
 */
export const FIELD_KEYS = {
  hasPaid: "has_paid",
  createdAt: "signup_date",
  emailConsent: "email_consent",
  firstName: "name",
  lastName: "last_name",
  city: "city",
  country: "country",
  dateOfBirth: "date_of_birth",
} as const;

export const MAILERLITE_API_BASE = "https://connect.mailerlite.com/api";

export const MAILERLITE_SUBSCRIBERS_URL = `${MAILERLITE_API_BASE}/subscribers`;
