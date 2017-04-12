import {get} from '../utils';
import {getAll} from '../utils/getAll';


/**
 * Prepares a controller for testing.
 *
 * @example
 *
 * import {
 *   module,
 *   controller,
 * } from '@collectivehealth/unity';
 *
 * describe('MyAwesomeCtrl', () => {
 *   let T;
 *
 *   beforeEach(() => {
 *     module('MyApp');
 *     T = controller('MyAwesomeCtrl');
 *   });
 *
 *   it('should be awesome', () => {
 *     //=> T:
 *     // {
 *     //   $scope: {},Controller's scope.
 *     //   MyAwesomeCtrl: // Controller.
 *     // }
 *   });
 * });
 *
 * @param  {string} name - Name of the controller being tested. Supports
 *   'controller as' syntax for testing controllers that use `$scope`.
 * @param  {object} [opts] - Options object.
 * @param  {object} [opts.locals] - Injection locals for the controller, will
 *   override the default injectable that the controller asks for.
 * @param  {array} [opts.inject] - Additional injectables to attach to the spec
 *   object for convenience.
 * @return  {object} - Spec object.
 */
export function controller (name, opts = {}) {
  const s = {};

  s.$scope = get('$rootScope').$new();

  // Parse controller expression.
  const [ctrlName, ctrlAs] = name.split(' as ');

  s[ctrlName] = get('$controller')(ctrlName, Object.assign({}, opts.locals, {
    $scope: s.$scope
  }));

  // Assign right hand side of controller-as expression, if defined, to $scope.
  if (ctrlAs) {
    s.$scope[ctrlAs] = s[ctrlName];
  }

  getAll(opts.inject, s);

  return s;
}
