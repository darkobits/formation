// -----------------------------------------------------------------------------
// ----- Control Base Class ----------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import {
  APPLY_CONFIGURATION,
  CONFIGURABLE_VALIDATOR,
  CUSTOM_ERROR_KEY,
  REGISTER_NG_MODEL_CALLBACK
} from '../../etc/constants';

import {
  mergeDeep,
  throwError
} from '../../etc/utils';


/**
 * Key in components' "require" definition that should reference the Formation
 * form controller.
 *
 * Shared between: control base class, control sub-classes.
 *
 * @memberOf FormationControl
 * @alias FORM_CONTROLLER
 *
 * @type {string}
 */
export const FORM_CONTROLLER = '$formController';


/**
 * Key in components' bindings that should contain control configuration.
 *
 * Shared between: form, component sub-classes.
 *
 * @memberOf FormationControl
 * @alias COMPONENT_CONFIGURATION
 *
 * @type {string}
 */
export const COMPONENT_CONFIGURATION = '$configuration';


/**
 * Key at which controls that use ngModel assign a reference to their ngModel
 * controller.
 *
 * Shared beetween: form, control sub-classes.
 *
 * @memberOf FormationControl
 * @alias NG_MODEL_CTRL
 *
 * @type {string}
 */
export const NG_MODEL_CTRL = '$ngModelCtrl';


/**
 * Key at which ngMessage tuples for a control will be stored.
 *
 * Shared between: form, control base class.
 *
 * @memberOf FormationControl
 * @alias NG_MESSAGES
 *
 * @type {string}
 */
export const NG_MESSAGES = '$ngMessages';


/**
 * Key at which the control will store custom error messags.
 *
 * @private
 *
 * @type {string}
 */
export const CUSTOM_ERROR_MESSAGE_KEY = '$customError';


/**
 * This class provides the functionality necessary for a component to interact
 * with a Formation form controller. It can be extended by component controllers
 * to create custom controls. All built-in Formation controls extend this class.
 *
 * ## Ways to use Formation
 *
 * 1. Use the built-in Formation components.
 *
 * 2. Create your own meta components that are composed of the built-in
 *    Formation components.
 *
 * 3. Create your own custom components that extend `FormationControl` and
 *    register them with `registerControl`.
 *
 * 4. Use `ngModel` on any element inside a Formation form to register the
 *    ngModel controller with the form.
 *
 * ### Extending FormationControl
 *
 * Components that extend `FormationControl` should use the the
 * `registerControl` method of the Formation service. This ensures the necessary
 * bindings are defined so that the control will work with Formation forms.
 * Additionally, custom components should adhere to the following guidelines:
 *
 * 1. Define a binding for either `name` or `for`, which should refer to the
 *    control name that the component will represent or interact with. Note that
 *    multiple control instances can exist using the same name; ex: radio
 *    buttons.
 *
 * 2. (Optional) If the component uses `ngModel`, ensure that the `ng-model`
 *    expression in the component's template references the controller's
 *    `$ngModelGetterSetter` property (provided by `FormationControl`).
 *
 * For a reference implementation, see `Input.js`.
 *
 * ### Control Configuration
 *
 * Control instances can be passed configuration at the control level and at the
 * form level, with the latter taking precedence over the former. This allows
 * generic components to be created that can be customized to suit a particular
 * form later. In both cases the following options are supported:
 *
 * - `parsers`: Array of parser functions.
 * - `formatters`: Array of formatter functions.
 * - `validators`: Object containing validator functions.
 * - `asyncValidators`: Object containing async validatior functions.
 * - `ngModelOptions`: Object with ngModelOptions configuration.
 * - `errors`: Array containing tuples of validation keys and error messages.
 */
export class FormationControl {

  constructor () {
    this[NG_MESSAGES] = [];
  }

  /* ----- Interfaces ------------------------------------------------------- */

  /**
   * Implement a callback for ngModel.
   *
   * @private
   *
   * @param {object} ngModelController
   */
  [REGISTER_NG_MODEL_CALLBACK] (ngModelController) {
    if (this[FORM_CONTROLLER]) {
      // Create a reference to the control's ngModel controller.
      this[NG_MODEL_CTRL] = ngModelController;

      // Register the control with the form.
      this[FORM_CONTROLLER].$registerControl(this);
    }
  }


  /**
   * Applies form-level configuration to a control (or mock control).
   *
   * TODO: Move to FormationControl class. Determine why it was here, probably a
   * reason.
   *
   * @private
   *
   * @param  {object} configuration - Configuration to apply.
   * @param  {object} control - Control instance.
   */
  [APPLY_CONFIGURATION] (configuration) {
    if (!this[NG_MODEL_CTRL]) {
      return;
    }

    // Merge provided configuration with local configuration.
    const mergedConfig = mergeDeep(R.pathOr({}, [COMPONENT_CONFIGURATION], this), configuration);

    const {
      errors,
      parsers,
      formatters,
      validators,
      asyncValidators,
      ngModelOptions
    } = mergedConfig;

    this[FORM_CONTROLLER].$debug(`Applying configuration to "${this.$getName()}":`, mergedConfig);

    // Set up error messages.
    if (Array.isArray(errors)) {
      errors.forEach(error => {
        if (!Array.isArray(error) || error.length !== 2) {
          throwError(`Expected error message tuple to be an array of length 2, got "${typeof error}".`);
        } else if (!R.contains(error, this[NG_MESSAGES])) {
          this[NG_MESSAGES].push(error);
        }
      });
    }


    // Set up parsers.
    if (Array.isArray(parsers)) {
      parsers.forEach(parser => {
        if (R.is(Function, parser)) {
          this[NG_MODEL_CTRL].$parsers.push(parser.bind(this[NG_MODEL_CTRL]));
        } else {
          throwError(`Expected parser to be a function, got "${typeof parser}".`);
        }
      });
    }


    // Set up formatters.
    if (Array.isArray(formatters)) {
      formatters.forEach(formatter => {
        if (R.is(Function, formatter)) {
          this[NG_MODEL_CTRL].$formatters.push(formatter.bind(this[NG_MODEL_CTRL]));
        } else {
          throwError(`Expected formatter to be a function, got "${typeof formatter}".`);
        }
      });
    }


    // Set up validators.
    if (R.is(Object, validators)) {
      R.mapObjIndexed((validator, name) => {
        if (!R.is(Function, validator)) {
          throwError(`Expected validator to be a function, got "${typeof validator}".`);
        } else if (!R.has(name, this[NG_MODEL_CTRL].$validators)) {
          if (validator[CONFIGURABLE_VALIDATOR]) {
            this[NG_MODEL_CTRL].$validators[name] = validator(this[FORM_CONTROLLER]).bind(this[NG_MODEL_CTRL]);
          } else {
            this[NG_MODEL_CTRL].$validators[name] = validator.bind(this[NG_MODEL_CTRL]);
          }
        }
      }, validators);
    }


    // Set up asyncronous validators.
    if (R.is(Object, asyncValidators)) {
      R.mapObjIndexed((asyncValidator, name) => {
        if (!R.is(Function, asyncValidator)) {
          throwError(`Expected validator to be a function, got "${typeof asyncValidator}".`);
        } else if (!R.has(name, this[NG_MODEL_CTRL].$asyncValidators)) {
          if (asyncValidator[CONFIGURABLE_VALIDATOR]) {
            this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator(this[FORM_CONTROLLER]).bind(this[NG_MODEL_CTRL]);
          } else {
            this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator.bind(this[NG_MODEL_CTRL]);
          }
        }
      }, asyncValidators);
    }


    // Configure ngModelOptions.
    if (R.is(Object, ngModelOptions)) {
      this[NG_MODEL_CTRL].$options = this[NG_MODEL_CTRL].$options.createChild(ngModelOptions);
    }


    // Validate the control to ensure any new parsers/formatters/validators
    // are run.
    this[NG_MODEL_CTRL].$validate();
  }


  /**
   * Returns the name of the control, or the name of the control that this
   * component is for.
   *
   * @private
   *
   * @return {string}
   */
  $getName () {
    return this.name || this.for;
  }


  /**
   * Returns true if the control should be disabled.
   *
   * @private
   *
   * @return {boolean}
   */
  $isDisabled () {
    return this.$ngDisabled || this.$disabled || this[FORM_CONTROLLER].$isDisabled();
  }


  /**
   * If the component has an ngModel controller, unregister it when the scope is
   * destroyed.
   *
   * @private
   */
  $onDestroy () {
    if (this[NG_MODEL_CTRL]) {
      this[FORM_CONTROLLER].$unregisterControl(this);
    }
  }


  /**
   * Returns a reference to the "canonical" control that this component instance
   * represents or interacts with. Ex: An error or other tertiary component
   * may use this to access the primary control of the same name.
   *
   * @private
   *
   * @return {object}
   */
  $getControl () {
    return this[FORM_CONTROLLER].getControl(this.$getName());
  }


  /**
   * Returns the ID used by the canonical control instance that this component
   * instance represents or interacts with.
   *
   * Example: The label used by the errors component will need the ID of the
   * control that it is "for", not the ID of its local element.
   *
   * @private
   *
   * @return {string}
   */
  $getCanonicalControlId () {
    const control = this.$getControl() || {};
    return `${this[FORM_CONTROLLER].$name}-${control.$uid}`;
  }


  /**
   * Resets the provided contol to an untouched, pristine state. Does not change
   * the control's model value.
   *
   * @private
   *
   * @param  {object} control
   */
  $resetControl () {
    if (this[NG_MODEL_CTRL]) {
      this[NG_MODEL_CTRL].$setUntouched();
      this[NG_MODEL_CTRL].$setPristine();
      this[NG_MODEL_CTRL].$validate();
    }
  }


  /**
   * Sets a custom error on the provided control and sets the "custom" validity
   * state to false.
   *
   * @private
   *
   * @param  {object} control
   * @param  {string} errorMessage
   */
  $setCustomError (errorMessage) {
    if (!R.is(String, errorMessage)) {
      throwError(`Expected error key to be of type "string" but got "${typeof errorMessage}".`);
    }

    this[FORM_CONTROLLER].$debug(`Setting custom error "${errorMessage}" on control "${this.$getName()}".`);
    this[CUSTOM_ERROR_MESSAGE_KEY] = errorMessage;
    this[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, false);
  }


  /**
   * Sets the "custom" validity state of the provided control to true, and
   * clears the custom error message.
   *
   * TODO: Move this to the FormationControl class.
   *
   * @private
   *
   * @param  {object} control
   */
  $clearCustomError () {
    if (R.path([NG_MODEL_CTRL, '$error', CUSTOM_ERROR_KEY], this)) {
      this[FORM_CONTROLLER].$debug(`Clearing custom error on control "${this.$getName()}".`);
      this[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, true);
      Reflect.deleteProperty(this, CUSTOM_ERROR_MESSAGE_KEY);
    }
  }


  /**
   * Used by ngModel (via ngModelOptions) to set and retreive model values.
   *
   * See: https://docs.angularjs.org/api/ng/directive/ngModelOptions
   *
   * @private
   *
   * @param {arglist} [args] - Arguments passed to the function.
   * @return {*} - Model value, if invoked without arguments.
   */
  $ngModelGetterSetter (...args) {
    if (args.length > 0) {
      const [newValue] = args;
      this.setModelValue(newValue);
    } else {
      return this.getModelValue();
    }
  }


  // ----- Public Methods ------------------------------------------------------

  /**
   * Returns the ID used by this control instance.
   *
   * @example
   *
   * vm.myForm.getControl('name').getControlId() => 'vm.myForm-name-2'
   *
   * @return {string}
   */
  getControlId () {
    return `${this[FORM_CONTROLLER].$name}-${this.$uid}`;
  }


  /**
   * If the named control should be displaying errors (based on configured
   * error behavior) returns the controls' `$error` object. Otherwise, returns
   * `false`.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {object}
   */
  getErrors () {
    const ngModelCtrl = this.$getControl()[NG_MODEL_CTRL];

    // If the control is valid, return.
    if (ngModelCtrl.$valid) {
      return false;
    }

    // If the user did not configure error behavior, return the control's errors
    // if it is invalid.
    if (R.isNil(this[FORM_CONTROLLER].showErrorsOn) || this[FORM_CONTROLLER].showErrorsOn === '') {
      return !ngModelCtrl.$valid && ngModelCtrl.$error;
    }

    // Otherwise, determine if the control should show errors.
    const errorState = this[FORM_CONTROLLER].showErrorsOn.reduce((accumulator, state) => {
      const controlHasState = ngModelCtrl[state];
      const formHasState = this[FORM_CONTROLLER][state];
      return accumulator || controlHasState || formHasState;
    }, false);

    return errorState ? ngModelCtrl.$error : false;
  }


  /**
   * Returns the configured error messages for the control.
   *
   * @example
   *
   * vm.myForm.getControl('name').getErrorMessages() => [
   *   ['required', 'This field is required.'],
   *   ['minLength', 'Please enter at least 4 characters.']
   * ]
   *
   * @return {array}
   */
  getErrorMessages () {
    return this.$getControl(this.$getName())[NG_MESSAGES] || [];
  }


  /**
   * Returns the current custom error message for the control, if set.
   *
   * @example
   *
   * vm.myForm.getControl('email').getCustomErrorMessage()
   * // => 'This e-mail address is in use. Please try again.'
   *
   * @return {string}
   */
  getCustomErrorMessage () {
    return this[FORM_CONTROLLER].getControl(this.$getName())[CUSTOM_ERROR_MESSAGE_KEY];
  }


  /**
   * Sets the local disabled flag on the control to false. Note that the control
   * will still be disabled if the form's disabled flag or an ngDisabled
   * expression on the control is truthy.
   */
  enable () {
    this.$disabled = false;
  }


  /**
   * Sets the local disabled flag on the control to true.
   */
  disable () {
    this.$disabled = true;
  }


  /**
   * Returns the control's model value.
   *
   * @example
   *
   * vm.myForm.getControl('age').getModelValue() => 42
   *
   * @return {*}
   */
  getModelValue () {
    return this[FORM_CONTROLLER].$getModelValue(this.$getName());
  }


  /**
   * Sets the control's model value.
   *
   * @example
   *
   * vm.myForm.getControl('name').setModelValue('Frodo');
   *
   * @param  {*} newValue - Value to set.
   */
  setModelValue (newValue) {
    this[FORM_CONTROLLER].$setModelValue(this.$getName(), R.clone(newValue));
  }
}


export default {
  FormationControl
};
