/**
 * Mirrors AgileEstimation.Domain.Enums.UserRole exactly.
 * This is the ONLY place that should know the string values the backend uses.
 *
 * This is now a real permission boundary, not just a label (see the
 * backend's Part 2 role-model rework):
 * - Moderator: creates sessions and tickets, can vote, reveals votes,
 *   resets a round, and locks the final estimate.
 * - Developer: votes secretly; after reveal, sees Developer + Moderator
 *   votes and their average — never Tester votes.
 * - Tester: votes secretly; after reveal, sees Tester + Moderator votes
 *   and their average — never Developer votes.
 */
export const USER_ROLES = {
  MODERATOR: "Moderator",
  DEVELOPER: "Developer",
  TESTER: "Tester",
} as const;

export type UserRoleValue = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const USER_ROLE_OPTIONS: { label: string; value: UserRoleValue }[] = [
  { label: "Developer", value: USER_ROLES.DEVELOPER },
  { label: "Tester", value: USER_ROLES.TESTER },
  { label: "Moderator", value: USER_ROLES.MODERATOR },
];
