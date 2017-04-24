import {
  is
} from 'ramda';

import {
  CONFIGURABLE_VALIDATOR,
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  isFunction,
  throwError
} from '../../etc/utils';


/**
 * Allows for the creation of complex validators that may need to access other
 * controls in the form. The provided function will have a reference to the
 * Formation form controller, its scope, and the control's ngModel controller
 * attached to its 'this' value.
 *
 * @example
 *
 * const myValidator = new ConfigurableValidator(function (modelValue) {
 *   const {form, ngModelCtrl} = this;
 *
 *   // Do something with modelValue/ngModelCtrl/form.
 * });
 */
export class ConfigurableValidator {
  constructor (validator) {
    if (!isFunction(validator)) {
      throwError([
        'ConfigurableValidator expected validator to be of type "Function",',
        `but got "${typeof validator}".`
      ].join(' '));
    }

    this.validator = validator.bind(this);

    // Assign the CONFIGURABLE_VALIDATOR flag so that the instance can be
    // identified as such by Formation. This must be used because instanceof
    // does not work across execution contexts,
    this[CONFIGURABLE_VALIDATOR] = true;
  }

  configure (formationControl) {
    this.form = formationControl[FORM_CONTROLLER];
    this.scope = this.form.$getScope();
    this.ngModelCtrl = formationControl[NG_MODEL_CTRL];
    return this.validator;
  }
}
