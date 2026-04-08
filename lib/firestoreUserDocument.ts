import type { FieldValue } from 'firebase/firestore';

/** String profile fields stored on `users/{uid}` (empty string when unset). */
export const USER_DOC_PROFILE_KEYS = [
  'firstName',
  'lastName',
  'city',
  'country',
  'dateOfBirth',
] as const;

export type UserDocProfileKey = (typeof USER_DOC_PROFILE_KEYS)[number];

/** Full initial shape for a new `users/{uid}` document. */
export function buildNewUserDocument(params: {
  email: string;
  emailConsent: boolean;
  createdAt: FieldValue;
}) {
  return {
    email: params.email,
    createdAt: params.createdAt,
    hasPaid: false,
    emailConsent: !!params.emailConsent,
    firstName: '',
    lastName: '',
    city: '',
    country: '',
    dateOfBirth: '',
  };
}

function isMissing(value: unknown): boolean {
  return value === undefined;
}

/**
 * Fields to merge onto an existing doc so every expected key exists.
 * Does not overwrite present values.
 */
export function mergePatchForMissingUserSchema(
  data: Record<string, unknown>
): Record<string, unknown> {
  const patch: Record<string, unknown> = {};
  for (const key of USER_DOC_PROFILE_KEYS) {
    if (isMissing(data[key])) patch[key] = '';
  }
  if (isMissing(data.emailConsent)) patch.emailConsent = false;
  if (isMissing(data.hasPaid)) patch.hasPaid = false;
  return patch;
}

export function stringFieldFromFirestore(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value;
}

export function profileFieldsFromUserDoc(
  data: Record<string, unknown> | undefined
): Record<UserDocProfileKey, string> {
  if (!data) {
    return {
      firstName: '',
      lastName: '',
      city: '',
      country: '',
      dateOfBirth: '',
    };
  }
  return {
    firstName: stringFieldFromFirestore(data.firstName),
    lastName: stringFieldFromFirestore(data.lastName),
    city: stringFieldFromFirestore(data.city),
    country: stringFieldFromFirestore(data.country),
    dateOfBirth: stringFieldFromFirestore(data.dateOfBirth),
  };
}
