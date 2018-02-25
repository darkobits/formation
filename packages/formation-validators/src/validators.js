/**
 * This module contains several common validators that can be used to configure
 * Formation controls.
 *
 * Note: Functions in the `validators` control configuration object will be
 * copied to a control's `$validators`, so they can be any function with the
 * signature:
 *
 * (modelValue: object, viewValue?: object) -> boolean
 */

import {
  isNil
} from 'ramda';

import {
  ConfigurableValidator,
  $constants
} from '@darkobits/formation';

const {
  NG_MODEL_CTRL
} = $constants;


/**
 * Returns true if the provided model value is not `null`, `undefined`, or an
 * empty string.
 *
 * @example
 *
 * import {
 *   required
 * } from '@darkobits/formation-validators';
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
  return !isNil(modelValue) && modelValue !== '';
}


/**
 * Accepts a number and returns a function that, when provided a model value,
 * returns true if the model value is greater than or equal to the number.
 *
 * @example
 *
 * import {
 *   min
 * } from '@darkobits/formation-validators';
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
 * import {
 *   minLength
 * } from '@darkobits/formation-validators';
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
 * import {
 *   max
 * } from '@darkobits/formation-validators';
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
 * import {
 *   maxLength
 * } from '@darkobits/formation-validators';
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


const EMAIL_PATTERN = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/g; // eslint-disable-line max-len, unicorn/regex-shorthand

/**
 * Returns true if the provided model value is a valid e-mail address according
 * to RFC 5322.
 *
 * @example
 *
 * import {
 *   email
 * } from '@darkobits/formation-validators';
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
 * import {
 *   pattern
 * } from '@darkobits/formation-validators';
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
 * import {
 *   match
 * } from '@darkobits/formation-validators';
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
  return new ConfigurableValidator(({form, control, scope}) => {
    /**
     * Reference to the independent (control we are matching against) Formation
     * control.
     *
     * @type {FormationControl}
     */
    const iCtrl = form.getControl(independentControlName);


    /**
     * Reference to the independent control's ngModel controller.
     *
     * @type {object}
     */
    const iNgModelCtrl = iCtrl[NG_MODEL_CTRL];


    /**
     * Reference to the dependent (this) Formation control.
     *
     * @type {FormationControl}
     */
    const dCtrl = control;


    /**
     * Reference to the dependent control's ngModel controller.
     *
     * @type {object}
     */
    const dNgModelCtrl = control[NG_MODEL_CTRL];


    // ----- Initialization ----------------------------------------------------

    // Watch for changes to the error states of both controls. When either
    // control enters or leaves its error state, validate the other control.
    scope.$watch(() => form.getControl(dCtrl.$getName()).getErrors(), (newValue, oldValue) => {
      if (newValue !== oldValue) {
        iNgModelCtrl.$validate();
      }
    });


    scope.$watch(() => form.getControl(iCtrl.$getName()).getErrors(), (newValue, oldValue) => {
      if (newValue !== oldValue) {
        dNgModelCtrl.$validate();
      }
    });


    // Install a complementary validator on the independent control that
    // will cause it to re-validate against this control's view value.
    iNgModelCtrl.$validators[`match:${dCtrl.$getName()}`] = (modelValue, viewValue) => {
      // Set the independent control's "match" validation key based on
      // whether its view value matches this control's view value. We must
      // always return true and set the validation key in a later digest
      // cycle or the co-validation process can cause an infinite loop.
      if (dNgModelCtrl.$viewValue) {
        scope.$applyAsync(() => {
          iNgModelCtrl.$setValidity('match', viewValue === dNgModelCtrl.$viewValue);
        });
      }

      return true;
    };


    // ----- Sanity-Checking ---------------------------------------------------

    // Ensure both controls use ngModel. If not, return a validator function
    // that always returns false.
    if (!iNgModelCtrl || !dNgModelCtrl) {
      form.$debug(`[match] Both controls must use ngModel.`);
      return () => false;
    }

    // Ensure we are not trying to match ourself. If so, return a validator
    // function that always returns true (effectively a no-op).
    if (iCtrl.$getName() === dCtrl.$getName()) {
      form.$debug(`Control "${dCtrl.$getName()}" is trying to match itself.`);
      return () => true;
    }


    // Match validator function that will be installed onto this control's
    // ngModel controller's $validators.
    return function (modelValue, viewValue) {
      if (viewValue) {
        scope.$applyAsync(() => {
          // Set this control's "match" validation key based on whether its view
          // value matches the independent control's view value.
          dNgModelCtrl.$setValidity('match', viewValue === iNgModelCtrl.$viewValue);
        });
      }

      return true;
    };
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
