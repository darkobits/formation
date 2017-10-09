import {curry} from 'ramda';


/**
 * Assigns a value to an expression on the provided scope.
 *
 * @param {object} $parse - Angular $parse service.
 * @param {object} scope - Angular scope to assign to.
 * @param {*}      value - Value to assign to scope.
 * @param {string} expression - Expression in scope's parent to assign value to.
 */
export default curry(($parse, scope, value, expression) => {
  let setter;

  if (expression === '') {
    setter = $parse('this[""]').assign;
  } else {
    setter = $parse(expression).assign;
  }

  if (setter) {
    setter(scope, value);
  }
});
