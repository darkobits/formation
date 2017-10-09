import assertIsEntry from './assertIsEntry';
import assertType from './assertType';


/**
 * Provided two lists of [key, value] entries, such as those generated using
 * Object.entries or Map.prototype.entries, returns a list of
 * [key, valueA, valueB] triplets by matching each entry in the source list with
 * each of its corresponding entries in the destination list. Extraneous entries
 * in the source list will be dropped.
 *
 * @param  {array}  dest - Destination set of entries.
 * @param  {array}  src  - Source set of entries.
 * @return {array}
 */
export default function mergeEntries (dest = [], src = []) {
  const check = assertType('mergeEntries');

  check(Array, 'first argument', dest);
  check(Array, 'second argument', src);

  return dest.map(destEntry => {
    assertIsEntry(destEntry);
    const match = src.find(srcEntry => assertIsEntry(srcEntry) && (srcEntry[0] === destEntry[0]));
    return [destEntry[0], destEntry[1], match ? match[1] : undefined];
  });
}
