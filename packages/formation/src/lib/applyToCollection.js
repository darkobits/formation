import {
  map,
  toPairs
} from 'ramda';

import invoke from './invoke';
import mergeEntries from './mergeEntries';
import toPairsWith from './toPairsWith';


/**
 * Applies a set of data to each member in a collection by matching data to
 * members and invoking a method on each member, passing it a data fragment.
 *
 * @example
 *
 * const collection = [
 *   {
 *     id: '1',
 *     setName: name => {
 *       this.name = name;
 *     }
 *   },
 *   {
 *     id: '2',
 *     setName: => {
 *       this.name = name;
 *     }
 *   }
 * ];
 *
 * const data = {
 *   '1': 'foo',
 *   '2': 'bar'
 * };
 *
 * // This will set the first item's name to 'foo', and the second item's name
 * // to 'bar', based on matching keys in 'data' to 'id' in collection members.
 * applyToCollection(collection, R.prop('id'), 'setName', data);
 *
 * @param {array} collection - Collection to apply data to.
 * @param {function} entryFn - Function to pass to toPairsWith to generate the
 *   key (left hand side) for each entry in 'collection'.
 * @param {string} memberFn - The function to invoke on each member in the
 *   collection to pass matched data fragments to.
 * @param {object|array} data - Data to disperse to members of 'collection'.
 */
export default function applyToCollection (collection, entryFn, memberFn, data) {
  // Convert collection to entries using the provided entry generation function.
  const collectionEntries = toPairsWith(entryFn, collection);

  // Convert data object to entries in the format [key, value].
  const dataEntries = toPairs(data || {});

  // Correlate data to registry members by common name/key, generating
  // triplets in the format [name, member, data].
  const mergedEntries = mergeEntries(collectionEntries, dataEntries);

  // For each triplet, invoke the provided method name on the collection member,
  // passing it its matching data. Return an entry in the format
  // [name, returnValue].
  return map(([name, member, data]) => {
    return [name, invoke(memberFn, member, data)];
  }, mergedEntries);
}
