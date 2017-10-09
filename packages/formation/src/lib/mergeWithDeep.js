import {
  append,
  head,
  mergeWith,
  nth,
  slice
} from 'ramda';


/**
 * Recursive version of R.mergeWith.
 *
 * @param  {function} f - Merging function.
 * @param  {arglist} objs - Objects to merge (right to left.)
 * @return {object}
 */
export default function mergeWithDeep (f, ...objs) {
  if (objs.length >= 2) {
    const d = nth(-2, objs) || {};
    const s = nth(-1, objs) || {};
    const merged = mergeWith(f, d, s);

    if (objs.length === 2) {
      return merged;
    }

    const rest = slice(0, -2, objs);
    return mergeWithDeep(f, ...append(merged, rest));
  } else if (objs.length === 1) {
    return head(objs);
  }

  return {};
}
