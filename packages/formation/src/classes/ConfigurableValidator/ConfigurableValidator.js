import {
  CONFIGURABLE_VALIDATOR,
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  assertType
} from '../../etc/utils';


/**
 * Allows for the creation of complex validators that may need to access other
 * controls in the form. The provided function will be bound to the validator
 * instance. Once configured, the validator will have references to the
 * Formation form controller, its scope, and the control's ngModel controller.
 *
 * @example
 *
 * const myValidator = new ConfigurableValidator(function (modelValue) {
 *   const {form, ngModelCtrl, scope} = this;
 *
 *   // Do something with modelValue/ngModelCtrl/form.
 * });
 */
export class ConfigurableValidator {
  constructor (validator) {
    assertType('ConfigurableValidator', [Function], 'validator', validator);

    this.validator = validator.bind(this);

    // Assign the CONFIGURABLE_VALIDATOR flag so that the instance can be
    // identified as such by Formation. This must be used because instanceof
    // does not work across execution contexts.
    this[CONFIGURABLE_VALIDATOR] = true;
  }

  configure (formationControl) {
    this.form = formationControl[FORM_CONTROLLER];
    this.scope = this.form.$getScope();
    this.ngModelCtrl = formationControl[NG_MODEL_CTRL];
    return this.validator;
  }
}
