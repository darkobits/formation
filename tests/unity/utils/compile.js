import {
  get
} from './get';


/**
 * Compiles the provided template string using the provided scope. If no scope
 * was provided, a new one will be created.
 *
 * @example
 *
 * let scope = get('$rootScope').$new();
 * scope.foo = 'bar';
 *
 * let el = compile('<div>{{ foo }}</div>')(scope);
 * el.find('div').innerHTML; // 'foo'
 *
 * @param  {string} options.template - Template string.
 * @param  {object} [options.scope] - Scope.
 * @return {object} - Compiled DOM element.
 */
export function compile ({template, scope} = {}) {
  let $scope;

  if (!scope || !scope.$id) {
    $scope = get('$rootScope').$new();
  } else {
    $scope = scope;
  }

  if (!template || typeof template !== 'string') {
    throw new Error('[createElement] No template provided.');
  }

  return get('$compile')(template)($scope);
}
