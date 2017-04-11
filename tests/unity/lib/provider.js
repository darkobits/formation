import {
  digest
} from '../utils';

import {
  getProviderInjector
} from '../utils/module';


/**
 * Prepares a provider for testing.
 *
 * @param  {string} name - Name of the provider.
 * @param  {object} [opts] - Options object.
 * @param  {array} [opts.inject] - Attach additional injectables to the spec
 *   object, for convenience.
 * @return  {object} - Spec object.
 */
export function provider (name, opts = {}) {
  const s = {};
  const providerInjector = getProviderInjector();

  if (!providerInjector) {
    throw new Error('[Unity] An Angular module must be loaded before testing.');
  }

  s[name] = providerInjector.get(name);

  // Use the provider injector to get optional injectables here.
  [].concat(opts.inject).forEach(injectable => {
    if (injectable) {
      s[injectable] = providerInjector.get(injectable);
    }
  });

  digest();

  return s;
}
