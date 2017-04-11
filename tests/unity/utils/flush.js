import {get} from './get';
import {digest} from './digest';

/**
 * Flushes common asynchronous Angular services, then run a digest cycle.
 *
 * |Token|Service|
 * |---|---|
 * |`'h'`, `'http'`|`$httpBackend`|
 * |`'t'`, `'timeout'`|`$timeout`|
 * |`'i'`, `'interval'`|`$interval`|
 * |`'a'`, `'animate'`|`$animate`|
 *
 * @example
 *
 * import {
 *   digest
 * } from '@collectivehealth/unity';
 *
 * // Flush $httpBackend, then run a digest cycle.
 * flush('http');
 *
 * // Flush $timeout and $interval, then run a digest cycle.
 * flush('t', 'i');
 *
 * @param  {arglist} args - Services to flush.
 */
export function flush (...services) {
  services.forEach(service => {
    switch (service) {
      case 'h':
      case 'http':
        get('$httpBackend').flush();
        break;
      case 't':
      case 'timeout':
        get('$timeout').flush();
        break;
      case 'i':
      case 'interval':
        get('$interval').flush();
        break;
      case 'a':
      case 'animate':
        get('$animate').flush();
        break;
      default:
        throw new Error(`[Unity.flush] Unknown token: "${service}"`);
    }
  });

  digest();
}
