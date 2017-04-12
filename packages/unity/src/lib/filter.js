import {getAll} from '../utils/getAll';

import {
  get,
  digest
} from '../utils';


/**
 * Prepares a filter for testing.
 *
 * @example
 *
 * import {
 *   module,
 *   filter
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeFilter', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *     T = filter('MyAwesomeFilter');
 *   });
 *
 *   it('should be awesome', () => {
 *     //=> T:
 *     // {
 *     //   MyAwesomeFilter: Object{ ... }
 *     // }
 *   });
 * });
 *
 * @param  {string} name - Name of the filter.
 * @param  {object} [opts] - Options object.
 * @param  {array} [opts.inject] - Attach additional injectables to the spec
 *   object, for convenience.
 * @return  {object} - Spec object.
 */
export function filter (name, opts = {}) {
  const s = {};

  s[name] = get('$filter')(name);

  getAll(opts.inject, s);

  digest();

  return s;
}
