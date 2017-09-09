import {
  CONFIGURABLE_VALIDATOR,
  FORM_CONTROLLER
} from '../../etc/constants';

import {
  assertType
} from '../../etc/utils';


/**
 * Allows for the creation of complex validators that may need to access other
 * controls in the form. The provided function will be bound to the validator
 * instance. Once configured, the validator will have references to the
 * Formation form controller, the control, and the form's its scope.
 *
 * @example
 *
 * const myValidator = new ConfigurableValidator(function ({form, control, scope}) {
 *   return function(modelValue, viewValue) {
 *     // Do something with modelValue/control/form, return a boolean.
 *   }
 * });
 */
export function ConfigurableValidator (validatorConfigurationFn) {
  assertType('ConfigurableValidator', [Function], 'validator configurator', validatorConfigurationFn);

  function configure (formationControl) {
    const form = formationControl[FORM_CONTROLLER];
    const scope = form.$getScope();
    const control = formationControl;

    const validatorFn = validatorConfigurationFn({form, control, scope});
    assertType('ConfigurableValidator', [Function], 'validator', validatorFn);
    return validatorFn;
  }

  /**
   * Assign the CONFIGURABLE_VALIDATOR flag so that the validator can be
   * identified as such by Formation. This must be used because instanceof
   * does not work across execution contexts.
   */
  configure[CONFIGURABLE_VALIDATOR] = true;

  return configure;
}
