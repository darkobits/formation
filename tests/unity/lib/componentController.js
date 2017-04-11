import angular from 'angular';

import {getAll} from '../utils/getAll';

import {
  get,
  digest
} from '../utils';


/**
 * Prepare a component's controller for testing.
 *
 * See:
 * - [Unit-testing Component Controllers]{@link https://docs.angularjs.org/guide/component#unit-testing-component-controllers}
 * - [$componentController]{@link https://docs.angularjs.org/api/ngMock/service/$componentController}
 *
 * @example
 *
 * import {
 *   module,
 *   componentController,
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeComponent', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *
 *     T = componentController('myAwesomeComponent', {
 *       bindings: {
 *         foo: 'bar',
 *         baz: 'qux'
 *       }
 *     });
 *   });
 *
 *   it('should be awesome', () => {
 *     //=> T:
 *     // {
 *     //   $scope: {},Component's parent scope.
 *     //   myAwesomeComponent: // Component's controller.
 *     // }
 *   });
 * });
 *
 * @param  {string} name - Component name.
 * @param  {object} opts - Options object.
 * @param  {object} [opts.locals] - Injection locals for the controller, will
 *   override the default injectable that the controller asks for. Useful for
 *   mocking injectables like $element.
 * @param  {object} [opts.bindings] - Optional bindings to pass to the
 *   controller instance.
 * @param  {array} [opts.scope] - Properties of the components's parent scope.
 * @param  {array} [opts.inject] - Attach additional injectables to the spec
 *   object, for convenience.
 * @param  {boolean} [opts.init=true] - Whether to automatically call the
 *   component's $onInit method. Defaults to `true`.
 * @return {object} - Spec object.
 */
export function componentController (name, opts = {}) {
  const s = {};

  // TODO: Get a reference to the component definition object and attach the
  // controller to the test $scope under the correct "controllerAs" alias
  // automatically.

  opts = Object.assign({}, {
    init: true,
    locals: {}
  }, opts);

  const $componentController = get('$componentController');

  // Create a new scope that inherits from $rootScope for testing the component.
  s.$scope = get('$rootScope').$new(true);

  if (opts.scope) {
    s.$scope.$apply(() => Object.assign(s.$scope, opts.scope));
  }

  // Create a new mock element.
  s.$element = angular.element('<div></div>');

  // Attach component's controller.
  s[name] = $componentController(name, Object.assign(opts.locals, {
    $scope: s.$scope,
    $element: s.$element
  }), opts.bindings);

  // Run the controller's $onInit lifecycle method, if it defines one.
  if (opts.init && typeof s[name].$onInit === 'function') {
    s[name].$onInit();
  }

  getAll(opts.inject, s);

  digest();

  return s;
}
