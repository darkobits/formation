import {
  get
} from './get';


/**
 * Run a digest cycle on the root scope.
 *
 * @example
 *
 * import {
 *   digest
 * } from '@collectivehealth/unity';
 *
 * digest();
 */
export function digest () {
  get('$rootScope').$digest();
}
