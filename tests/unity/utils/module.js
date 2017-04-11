import angular from 'angular';

let $providerInjector;


/**
 * Instantiates one or more modules. By default, ui-router's `$urlRouter` is
 * disabled to prevent the router from interfering with tests. This can be
 * overridden if needed. Additional mocked injectables can be specified.
 *
 * @example
 *
 * import {
 *   module,
 *   get
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeSpec', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyAwesomeApp', 'MyOtherApp', {
 *       mock: {
 *         SomeAwesomeService: {
 *           callApi: function () {
 *             return get('$q').resolve()
 *           },
 *           logOut: function () {
 *             return true;
 *           }
 *         }
 *       }
 *     });
 *   });
 *
 *   // ...
 * });
 *
 * @param {arglist} module - List of module names to load. Last argument may be
 *   an options object (`opts`).
 * @param {boolean} [opts.disableUiRouter=true] - Whether to disable ui-router.
 * @param {object} [opts.mock] - Object with values that will be used to
 *   create mocked injectables.
 */
export function module (...args) {
  let modules;

  const opts = {
    disableUrlRouter: true
  };


  if (typeof args.slice(-1)[0] === 'object') {
    // If the last argument is an object, merge it with the default options and
    // use the remaining arguments as a list of modules to load.
    Object.assign(opts, args.slice(-1)[0]);
    modules = args.slice(0, args.length - 1);
  } else {
    // Otherwise, assume each argument is a module name.
    modules = args;
  }


  if (!modules.length) {
    throw new Error('[unity] module() expects at least 1 module name.');
  }


  // Load each module.
  modules.forEach(moduleName => {
    angular.mock.module(moduleName);
  });


  angular.mock.module(($provide, $injector) => {
    // Safe a reference to the provider injector.
    $providerInjector = $injector;

    // Disable ui-router.
    if (opts.disableUrlRouter) {
      try {
        $injector.get('$urlRouterProvider').deferIntercept();
      } catch (err) {
        // Application does not use ui-router.
      }
    }


    // (Optionally) create additional mocked values.
    if (opts.mock) {
      Object.keys(opts.mock).forEach(name => {
        const value = opts.mock[name];
        $provide.value(name, value);
      });
    }
  });


  // Finally, initialize the injector.
  angular.mock.inject();
}


/**
 * Returns the injector needed to access providers, saved after a module is
 * instantiated.
 *
 * @return {object}
 */
export function getProviderInjector () {
  return $providerInjector;
}
