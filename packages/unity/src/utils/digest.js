import {
  get
} from './get';


/**
 * Run a digest cycle on the root scope and flush any pending $applyAsync calls.
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

  // This will ensure any pending $applyAsync calls are run.
  // See: https://github.com/angular/angular.js/issues/10788
  try {
    get('$browser').defer.flush();
  } catch (err) {
    // If there were no pending async tasks to flush, ignore the error.
    // Otherwise, re-throw it.
    if (!/No deferred tasks to be flushed/g.test(err.message)) {
      throw err;
    }
  }
}
