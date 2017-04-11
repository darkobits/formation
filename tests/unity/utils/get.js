import angular from 'angular';

/**
 * Returns the named injectable. Throws an error if the injectable doesn't
 * exist.
 *
 * @example
 *
 * import {
 *   get
 * } from '@collectivehealth/unity';
 *
 * let q = get('$q');
 *
 * @param  {string} name - Name of an injectable.
 * @return {object} - Injectable instance.
 */
export function get (name) {
  let injectable;

  try {
    angular.mock.inject($injector => {
      injectable = $injector.get(name);
    });

    return injectable;
  } catch (error) {
    throw new Error(`[Unity] Cannot find injectable "${name}": ${error.message}`);
  }
}
