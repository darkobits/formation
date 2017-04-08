// -----------------------------------------------------------------------------
// ----- Validators ------------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * @module Validators
 *
 * @description
 *
 * This module contains several common validators that can be used to configure
 * Formation controls.
 *
 * Note: Functions in the `validators` control configuration object will be
 * copied to a control's `$validators`, so they can be any function that accepts
 * a model value (and/or view value) and returns a boolean.
 */

import R from 'ramda';

import {
  ConfigurableValidator
} from '../classes/ConfigurableValidator';

import {
  capitalizeFirst
} from './utils';

import {
  NG_MODEL_CTRL
} from './constants';


/**
 * Returns true if the provided model value is not `null`, `undefined`, or an
 * empty string.
 *
 * @example
 *
 * import {required} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   name: {
 *     validators: {
 *       required
 *     }
 *   }
 * };
 *
 * @param  {*} modelValue
 * @return {boolean}
 */
export function required (modelValue) {
  return !R.isNil(modelValue) && modelValue !== '';
}


/**
 * Accepts a number and returns a function that, when provided a model value,
 * returns true if the model value is greater than or equal to the number.
 *
 * @example
 *
 * import {min} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   age: {
 *     validators: {
 *       min: min(12)
 *     }
 *   }
 * };
 *
 * @param  {number} value
 * @return {function}
 */
export function min (value) {
  return modelValue => {
    return Number(modelValue) >= Number(value);
  };
}


/**
 * Accepts a number and returns a function that, when provided a model value,
 * returns true if the length of the string representation of the model value is
 * greater than or equal to the number.
 *
 * @example
 *
 * import {minLength} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   address: {
 *     validators: {
 *       minLength: minLength(10)
 *     }
 *   }
 * };
 *
 * @param  {number} length
 * @return {function}
 */
export function minLength (length) {
  return modelValue => {
    return String(modelValue).length >= Number(length);
  };
}


/**
 * Accepts a number and returns a function that, when provided a model value,
 * returns true if the model value is less than or equal to the number.
 *
 * @example
 *
 * import {max} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   quantity: {
 *     validators: {
 *       max: max(50)
 *     }
 *   }
 * };
 *
 * @param  {number} value
 * @return {function}
 */
export function max (value) {
  return modelValue => {
    return Number(modelValue) <= Number(value);
  };
}


/**
 * Accepts a number and returns a function that, when provided a model value,
 * returns true if the length of the string representation of the model value is
 * less than or equal to the number.
 *
 * @example
 *
 * import {maxLength} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   message: {
 *     validators: {
 *       maxLength: maxLength(1024)
 *     }
 *   }
 * };
 *
 * @param  {number} length
 * @return {function}
 */
export function maxLength (length) {
  return modelValue => {
    return String(modelValue).length <= Number(length);
  };
}


const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g; // eslint-disable-line max-len

/**
 * Returns true if the provided model value is a valid e-mail address according
 * to RFC 5322.
 *
 * @example
 *
 * import {email} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   email: {
 *     validators: {
 *       email
 *     }
 *   }
 * };
 *
 * @param  {string} modelValue
 * @return {boolean}
 */
export function email (modelValue) {
  return Boolean(String(modelValue).match(EMAIL_PATTERN));
}


/**
 * Accepts a pattern and returns a function that, when provided a view value,
 * returns true if the view value matches the pattern.
 *
 * @example
 *
 * import {pattern} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   postalCode: {
 *     validators: {
 *       pattern: pattern(/^\d{5}$/g)
 *     }
 *   }
 * };
 *
 * @param  {regex} pattern
 * @return {function}
 */
export function pattern (pattern) {
  return (modelValue, viewValue) => {
    return Boolean(String(viewValue).match(pattern));
  };
}


/**
 * Accepts a control name and returns a validator configuration function which
 * will be invoked by the form and will return a function that, when provided a
 * model value, will return true if the model value matches the model value of
 * the named control.
 *
 * @example
 *
 * import {match} from 'formation/etc/validators';
 *
 * vm.controls = {
 *   password: { ... },
 *   passwordMatch: {
 *     validators: {
 *       match: match('password')
 *     }
 *   }
 * };
 *
 * @param  {string} independentControlName - Control name to match against.
 * @return {function}
 */
export function match (independentControlName) {
  return new ConfigurableValidator(function (modelValue) {
    const {scope, form, ngModelCtrl} = this;
    const independentNgModelCtrl = R.path([NG_MODEL_CTRL], form.getControl(independentControlName));


    // Ensure both controls use ngModel.
    if (!ngModelCtrl || !independentNgModelCtrl) {
      form.$debug(`[match] Both controls must use ngModel.`);
      return false;
    }

    // Ensure we are not trying to match ourself.
    if (ngModelCtrl.$name === independentNgModelCtrl.$name) {
      form.$debug(`Control "${ngModelCtrl.$name}" is trying to match itself.`);
      return true;
    }

    // Compute the name to use for the complementary validator to install on
    // the independent control. Ex: '$matchPassword'
    const validatorName = `$match${capitalizeFirst(ngModelCtrl.$name)}`;

    // If not present, install complementary validator. This validator always
    // returns true, but ensures that when the independent control is
    // modified, this control will re-validate.
    if (!independentNgModelCtrl.$validators[validatorName]) {
      independentNgModelCtrl.$validators[validatorName] = () => {
        // When this validator is triggered, the control will be in the middle
        // of a validation cycle, and its model value will temporarily be
        // undefined until the cycle completes. Therefore, we need to wait until
        // the next digest cycle, then tell the dependent control to
        // re-validate.
        scope.$applyAsync(() => {
          ngModelCtrl.$validate();
        });

        return true;
      };
    }

    return modelValue === independentNgModelCtrl.$modelValue;
  });
}


export default {
  required,
  min,
  minLength,
  max,
  maxLength,
  email,
  pattern,
  match
};
