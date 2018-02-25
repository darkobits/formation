import isPlainObject from 'is-plain-object';
import {concat} from 'ramda';
import mergeWithDeep from './mergeWithDeep';


/**
 * Default merging function.
 *
 * - If values are primitives, use the value from source object, overwriting the
 *   value in the destination object.
 * - If values are arrays, the source array is prepended to the destination
 *   array. (Important for merging arrays of ngMessages.)
 * - If values are objects, deep merge them.
 *
 * @param  {object} d - Destination object.
 * @param  {object} s - Source object.
 * @return {object} - Merged object.
 */
const DEFAULT_MERGER = (d, s) => {
  if (Array.isArray(d) && Array.isArray(s)) {
    // [Arrays] Prepend the array from the source object to the one in the
    // destination object.
    return concat(s, d);
  }

  if (isPlainObject(d) && isPlainObject(s)) {
    // [Objects] Recursively deep-merge plain objects.
    return mergeWithDeep(DEFAULT_MERGER, d, s);
  }

  // [Values] Otherwise, return the source value, overwriting the
  return s;
};


/**
 * Partially-applied version of mergeWithDeep using the default merger.
 *
 * @param  {arglist} objs - Objects to merge.
 * @return {object} - Merged object.
 */
export default function mergeDeep (...objs) {
  return mergeWithDeep(DEFAULT_MERGER, ...objs);
}
