import angular from 'angular';

import {getAll} from '../utils/getAll';

import {
  get,
  digest
} from '../utils';


/**
 * Prepares a directive for testing.
 *
 * Directives require a template, analogous to a function's call site, that will
 * determine how the directive will be instantiated and its behavior. To
 * thoroughly test a directive it may need to be compiled with several different
 * template configurations.
 *
 * The structure of the returned spec object will vary depending on the type of
 * directive being tested. In all cases, the spec will have the following
 * properties:
 *
 * - `$scope` - Reference to the scope in which the directive was compiled. If
 *   the directive uses a child scope or an isolate scope, this will be the
 *   directive's parent scope. If the directive does not use scope inheritance,
 *   this will be the same scope used by the directive.
 * - `$element` - Reference to the jqLite element that the directive was
 *   compiled on.
 *
 * Additionally, the object may have the following properties:
 *
 * - `<Directive Name>` - Reference to the directive's controller, if it has
 *   one.
 * - `$isolateScope` - Reference to the directive's isolate scope, if it uses
 *   one.
 *
 * @example
 *
 * import {
 *   module,
 *   directive,
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeDirective', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *
 *     T = directive('MyAwesomeDirective', {
 *       template: `
 *         <my-awesome-directive
 *           ng-model="foo">
 *         </my-awesome-directive>
 *       `,
 *       scope: {
 *         foo: 'bar'
 *       }
 *     });
 *   });
 *
 *   it('should be awesome', () => {
 *     //=> T:
 *     // {
 *     //   $scope: {} // Directive's parent scope.
 *     //   $isolateScope: {} // Directive's isolate scope.
 *     //   $element: {} // Directive's element.
 *     //   myAwesomeDirective: // Directives's controller.
 *     // }
 *   });
 * });
 *
 * @param  {string}  name - Directive name.
 * @param  {object}  opts - Options object.
 * @param  {string}  opts.template - Template to use to test the directive.
 * @param  {string}  [opts.wrap] - Template string to .wrap() around the
 *   directive's primary template. Useful for directives that `require` a
 *   parent directive in order to function, or otherwise depend on context.
 * @param  {object}   [opts.scope] - Properties of the directive's parent scope.
 * @param {array} [opts.inject] - Additional injectables to attach to the spec
 *   object for convenience.
 * @return  {object} - Spec object.
 */
export function directive (name, opts = {}) {
  const s = {};
  let compiledDirective;

  // Ensure the injector has the directive. This will throw if it doesn't.
  get(name + 'Directive');

  // Ensure the user provided a template.
  if (!opts.template) {
    throw new Error('[Unity] Directives require a template.');
  }

  // Create a new scope that inherits from $rootScope for the test.
  s.$scope = get('$rootScope').$new();

  if (opts.scope) {
    s.$scope.$apply(() => Object.assign(s.$scope, opts.scope));
  }

  if (opts.wrap) {
    let compiledWrapper;

    if (typeof opts.wrap === 'string') {
      // Compile the wrapper element.
      compiledWrapper = get('$compile')(opts.wrap)(s.$scope);
    } else if (typeof opts.wrap === 'object') {
      // Assume opts.wrap is a pre-compiled element.
      compiledWrapper = opts.wrap;
    }

    // Construct directive's template.
    const directiveEl = angular.element(opts.template);

    if (compiledWrapper.find('transclude').length === 1) {
      // Insert the directive element at the indicated transclusion point.
      compiledWrapper.find('transclude').replaceWith(directiveEl);
    } else if (compiledWrapper.find('transclude').length > 1) {
      throw new Error('[Unity] Only 1 transclusion slot allowed.');
    } else {
      // Append template to compiled wrapper.
      compiledWrapper.append(directiveEl);
    }

    // Compile directive.
    compiledDirective = get('$compile')(directiveEl)(s.$scope);
  } else {
    // Use simple directive compilation.
    compiledDirective = get('$compile')(opts.template)(s.$scope);
  }

  // Attach directive's controller and element to instance.
  s[name] = compiledDirective.controller(name);
  s.$element = compiledDirective;

  // Attach isolate scope.
  if (compiledDirective.isolateScope) {
    s.$isolateScope = compiledDirective.isolateScope();
  }

  getAll(opts.inject, s);

  digest();

  return s;
}
