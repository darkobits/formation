import {is} from 'ramda';


/**
 * Jest's mocked functions fail a Function type check, but their 'typeof' is
 * still 'function', so we need to use this custom predicate to ensure
 *
 * @param  {any} value
 * @return {boolean}
 */
export default function isFunction (value) {
  return is(Function, value) || typeof value === 'function';
}
