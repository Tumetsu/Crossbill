import { DateTime } from 'luxon';

/**
 * Format a date string to a readable format
 */
export const formatDate = (date: string | Date): string => {
  return DateTime.fromISO(date.toString()).toLocaleString(DateTime.DATE_MED);
};

/**
 * Format a date string to include time
 */
export const formatDateTime = (date: string | Date): string => {
  return DateTime.fromISO(date.toString()).toLocaleString(DateTime.DATETIME_MED);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  return DateTime.fromISO(date.toString()).toRelative() || '';
};

/**
 * Parse ISO date string to DateTime object
 */
export const parseDate = (date: string): DateTime => {
  return DateTime.fromISO(date);
};

/**
 * Check if a date is valid
 */
export const isValidDate = (date: string): boolean => {
  return DateTime.fromISO(date).isValid;
};
