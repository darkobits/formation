import {type} from 'ramda';
import throwError from './throwError';


/**
 * Throws an error if the provided value is not a [key, value] entry. Otherwise,
 * returns true.
 *
 * @param  {any} value
 * @param  {string} [label] - Optional label.
 * @return {boolean}
 */
export default function assertIsEntry (value, label) {
  if (!Array.isArray(value) || value.length !== 2) {
    throwError([
      `Expected ${label ? label + ' to be a ' : ''}[key, value] entry,`,
      `but got ${type(value)}.`
    ].join(' '));
  }

  return true;
}
