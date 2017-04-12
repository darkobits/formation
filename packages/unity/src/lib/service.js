import {getAll} from '../utils/getAll';

import {
  get,
  digest
} from '../utils';


/**
 * Configures a service for testing.
 *
 * @example
 *
 * import {
 *   module,
 *   service
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeService', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *
 *     T = service('MyAwesomeService', {
 *       inject: ['$httpBackend']
 *     });
 *   });
 *
 *   it('should be awesome', () => {
 *     //=> T:
 *     // {
 *     //   MyAwesomeService: Object{ ... },
 *     //   $httpBackend: Object{ ... }
 *     // }
 *   });
 * });
 *
 * @param  {string} name - Name of the service being tested.
 * @param  {object} [opts] - Options object.
 * @param  {array} [opts.inject] - Attach additional injectables to the spec
 *   object, for convenience.
 * @return {object} - Spec object.
 */
export function service (name, opts = {}) {
  const s = {};

  // Attach the service to the spec if it exists. If not, this will throw.
  s[name] = get(name);

  getAll(opts.inject, s);

  digest();

  return s;
}
