import { debounce, groupBy, isEmpty, memoize, sortBy, uniqBy } from 'lodash';

/**
 * Debounced search handler
 */
export const createDebouncedSearch = <T extends (...args: never[]) => unknown>(fn: T, wait = 300) =>
  debounce(fn, wait);

/**
 * Memoized computation
 */
export const memoizeComputation = <T extends (...args: never[]) => unknown>(fn: T) => memoize(fn);

/**
 * Check if value is empty (lodash)
 */
export { isEmpty };

/**
 * Group array items by key
 */
export { groupBy };

/**
 * Sort array by key or function
 */
export { sortBy };

/**
 * Get unique items from array
 */
export { uniqBy };

/**
 * Safe array access
 */
export const safeArrayAccess = <T>(arr: T[] | undefined | null, index: number): T | undefined => {
  return arr?.[index];
};

/**
 * Capitalize first letter of string
 */
export const capitalize = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate string to specified length
 */
export const truncate = (str: string, length: number): string => {
  if (!str || str.length <= length) return str;
  return `${str.slice(0, length)}...`;
};
