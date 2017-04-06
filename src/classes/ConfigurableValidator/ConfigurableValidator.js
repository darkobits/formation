import R from 'ramda';

import {
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
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
    if (!R.is(Function, validator)) {
      throwError([
        'ConfigurableValidator expected validator to be of type "Function",',
        `but got "${typeof validator}".`
      ].join(' '));
    }

    this.validator = validator.bind(this);
  }

  configure (formationControl) {
    this.form = formationControl[FORM_CONTROLLER];
    this.scope = this.form.$getScope();
    this.ngModelCtrl = formationControl[NG_MODEL_CTRL];
    return this.validator;
  }
}
