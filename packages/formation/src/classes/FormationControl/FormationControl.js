// -----------------------------------------------------------------------------
// ----- Control Base Class ----------------------------------------------------
// -----------------------------------------------------------------------------

import {
  clone,
  contains,
  has,
  is,
  isNil,
  mapObjIndexed,
  path,
  pathOr
} from 'ramda';

import {
  COMPONENT_CONFIGURATION,
  CONFIGURABLE_VALIDATOR,
  CUSTOM_ERROR_KEY,
  FORM_CONTROLLER,
  NG_MODEL_CTRL,
  NG_MODEL_GETTER_SETTER
} from '../../etc/constants';

import {
  assertIsEntry,
  assertType,
  mergeDeep
} from '../../etc/utils';

import {
  ClearCustomErrorMessage,
  Configure,
  GetModelValue,
  RegisterControl,
  RegisterNgModel,
  Reset,
  SetCustomErrorMessage,
  SetModelValue
} from '../../etc/interfaces';


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
 * Curried assertType.
 *
 * Remaining parameters:
 *
 * @param {string} label
 * @param {any} value
 *
 * @return {boolean}
 */
const assertIsFunction = assertType('FormationControl', Function);


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
 *    `$ngModelGetterSetter` property.
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

    this.$parsers = [];
    this.$formatters = [];
    this.$validators = {};
    this.$asyncValidators = {};

    // Expose interfaces as public methods.
    this.getModelValue = this[GetModelValue];
    this.setModelValue = this[SetModelValue];
  }


  // ----- Semi-Public Methods -------------------------------------------------

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
   * Returns the name of the form that this control belongs to.
   *
   * @private
   *
   * @return {string}
   */
  $getFormName () {
    return this[FORM_CONTROLLER] && this[FORM_CONTROLLER].name;
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
   * represents or interacts with. Ex: An error or other tertiary component that
   * doesn't use ngModel may use this to access the primary control of the same
   * name. This works by virtue of the fact that components that do not use
   * ngModel do not register as controls with the form.
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
    return this.$getControl().getControlId();
  }


  /**
   * Used by ngModel (via ngModelOptions) to set and retreive model values using
   * the GetModelValue and SetModelValue interfaces.
   *
   * See: https://docs.angularjs.org/api/ng/directive/ngModelOptions
   *
   * @private
   *
   * @param {arglist} [args] - Arguments passed to the function.
   * @return {*} - Model value, if invoked without arguments.
   */
  [NG_MODEL_GETTER_SETTER] (...args) {
    if (args.length > 0) {
      const [newValue] = args;

      // This does not defer to the SetModelValue implementation because
      // validators will need to be able to clear a model value when validation
      // fails by setting it to undefined.
      this[FORM_CONTROLLER].$setModelValue(this.$getName(), clone(newValue));
    } else {
      return this[GetModelValue]();
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
    return `${this[FORM_CONTROLLER].name}-${this.$uid}`;
  }


  /**
   * If the canonical control should be displaying errors (based on configured
   * error behavior) returns the controls' `$error` object. Otherwise, returns
   * `false`.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {object}
   */
  getErrors () {
    const control = this.$getControl();

    if (!control) {
      // The form has no control matching our name/for attribute.
      return false;
    }

    const ngModelCtrl = this.$getControl()[NG_MODEL_CTRL];
    const errorBehavior = this[FORM_CONTROLLER].$getErrorBehavior();

    // If the control is valid, return.
    if (ngModelCtrl.$valid) {
      return false;
    }

    // If the user did not configure error behavior, return the control's errors
    // if it is invalid.
    if (isNil(errorBehavior) || errorBehavior === '') {
      return !ngModelCtrl.$valid && ngModelCtrl.$error;
    }

    // Otherwise, determine if the control should show errors.
    const errorState = errorBehavior.reduce((accumulator, state) => {
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
   * Returns true if the control is disabled.
   *
   * @return {boolean}
   */
  isDisabled () {
    return this.$ngDisabled || this.$disabled || this[FORM_CONTROLLER].isDisabled();
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
}


// ----- Interfaces ------------------------------------------------------------

/**
 * Configures the control by merging the provided configuration object with
 * the control's local configuration object.
 *
 * @param  {object} configuration - Configuration to apply.
 */
Configure.implementedBy(FormationControl).as(function (configuration) {
  if (!this[NG_MODEL_CTRL]) {
    // If this control doesn't use ngModel (ex: Errors) bail.
    return;
  }

  // Merge provided configuration with local configuration.
  const mergedConfig = mergeDeep(pathOr({}, [COMPONENT_CONFIGURATION], this), configuration);

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
      assertIsEntry(error, 'error message');

      if (!contains(error, this[NG_MESSAGES])) {
        this[NG_MESSAGES].push(error);
      }
    });
  }


  // Set up parsers.
  if (Array.isArray(parsers)) {
    parsers.forEach(parser => {
      if (contains(parser, this.$parsers)) {
        // Parser already exists on this control, bail.
        this[FORM_CONTROLLER].$debug(`Control "${this.$getName()}" already has parser:`, parser);
        return;
      }

      assertIsFunction('parser', parser);

      // Store the original function in $parsers so we can compare against it
      // later.
      this.$parsers.push(parser);

      // Add a bound version of the parser to ngModelCtrl.$parsers.
      this[NG_MODEL_CTRL].$parsers.push(parser.bind(this[NG_MODEL_CTRL]));
    });
  }


  // Set up formatters.
  if (Array.isArray(formatters)) {
    formatters.forEach(formatter => {
      if (contains(formatter, this.$formatters)) {
        // Formatter already exists on this control, bail.
        this[FORM_CONTROLLER].$debug(`Control "${this.$getName()}" already has formatter:`, formatter);
        return;
      }

      assertIsFunction('formatter', formatter);

      // Store the original function in $formatters so we can compare against it
      // later.
      this.$formatters.push(formatter);

      // Add a bound version of the formatter to ngModelCtrl.$formatters.
      this[NG_MODEL_CTRL].$formatters.push(formatter.bind(this[NG_MODEL_CTRL]));
    });
  }


  // Set up validators.
  if (is(Object, validators)) {
    mapObjIndexed((validator, name) => {
      if (validator === false) {
        // Remove the named validator.
        if (has(name, this[NG_MODEL_CTRL].$validators)) {
          this[FORM_CONTROLLER].$debug(`Removing validator "${name}" from control "${this.$getName()}".`);
        }

        Reflect.deleteProperty(this[NG_MODEL_CTRL].$validators, name);
        this[NG_MODEL_CTRL].$setValidity(name, true);
        return;
      }

      if (this.$validators[name] === validator) {
        // Validator already exists on this control, bail.
        this[FORM_CONTROLLER].$debug(`Control "${this.$getName()}" already has validator:`, validator);
        return;
      }

      // Store the original function in $validators so we can compare against it
      // later.
      this.$validators[name] = validator;

      if (validator && validator[CONFIGURABLE_VALIDATOR]) {
        // Check against the CONFIGURABLE_VALIDATOR constant here rather than
        // using is() because instanceof does not work across execution
        // contexts.
        this[NG_MODEL_CTRL].$validators[name] = validator.configure(this);
      } else {
        assertIsFunction('validator', validator);
        this[NG_MODEL_CTRL].$validators[name] = validator.bind(this[NG_MODEL_CTRL]);
      }
    }, validators);
  }


  // Set up asyncronous validators.
  if (is(Object, asyncValidators)) {
    mapObjIndexed((asyncValidator, name) => {
      if (asyncValidator === false) {
        // Remove the named async validator.
        if (has(name, this[NG_MODEL_CTRL].$asyncValidators)) {
          this[FORM_CONTROLLER].$debug(`Removing async validator "${name}" from control "${this.$getName()}".`);
        }

        Reflect.deleteProperty(this[NG_MODEL_CTRL].$asyncValidators, name);
        this[NG_MODEL_CTRL].$setValidity(name, true);
        return;
      }

      if (this.$asyncValidators[name] === asyncValidator) {
        // Async validator already exists on this control, bail.
        this[FORM_CONTROLLER].$debug(`Control "${this.$getName()}" already has async validator:`, asyncValidator);
        return;
      }

      // Store the original function in $asyncValidators so we can compare
      // against it later.
      this.$asyncValidators[name] = asyncValidator;

      if (asyncValidator && asyncValidator[CONFIGURABLE_VALIDATOR]) {
        // Check against the CONFIGURABLE_VALIDATOR constant here rather than
        // using is() because instanceof does not work across execution
        // contexts.
        this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator.configure(this);
      } else {
        assertIsFunction('async validator', asyncValidator);
        this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator.bind(this[NG_MODEL_CTRL]);
      }
    }, asyncValidators);
  }


  // Configure ngModelOptions.
  if (is(Object, ngModelOptions)) {
    this[NG_MODEL_CTRL].$options = this[NG_MODEL_CTRL].$options.createChild(ngModelOptions);
  }


  // Validate the control to ensure any new parsers/formatters/validators
  // are run.
  this[NG_MODEL_CTRL].$validate();
});


/**
 * Register and configure the provided ngModel controller.
 *
 * @param  {object} ngModelCtrl
 */
RegisterNgModel.implementedBy(FormationControl).as(function (ngModelCtrl) {
  // Configure the control.
  if (this[COMPONENT_CONFIGURATION]) {
    this[Configure]();
  }

  if (this[FORM_CONTROLLER]) {
    // Create a reference to the control's ngModel controller.
    this[NG_MODEL_CTRL] = ngModelCtrl;

    // Register the control with the form.
    this[FORM_CONTROLLER][RegisterControl](this);
  }
});


/**
 * Returns the control's model value.
 *
 * @example
 *
 * vm.myForm.getControl('age').getModelValue() => 42
 *
 * @return {*}
 */
GetModelValue.implementedBy(FormationControl).as(function () {
  return this[FORM_CONTROLLER].$getModelValue(this.$getName());
});


/**
 * If the provided value is undefined, sets the control's model value.
 *
 * @example
 *
 * vm.myForm.getControl('name').setModelValue('Frodo');
 *
 * @param  {*} newValue - Value to set.
 */
SetModelValue.implementedBy(FormationControl).as(function (modelValue) {
  if (modelValue !== undefined) {
    this[FORM_CONTROLLER].$setModelValue(this.$getName(), clone(modelValue));
  }
});


/**
 * Sets a custom error on the control and sets the "custom" validity state to
 * false.
 *
 * @private
 *
 * @param  {string} errorMessage
 */
SetCustomErrorMessage.implementedBy(FormationControl).as(function (errorMessage) {
  if (errorMessage) {
    assertType('FormationControl', String, 'error message', errorMessage);

    this[FORM_CONTROLLER].$debug(`Setting custom error "${errorMessage}" on control "${this.$getName()}".`);
    this[CUSTOM_ERROR_MESSAGE_KEY] = errorMessage;
    this[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, false);
  }
});


/**
 * Sets the "custom" validity state of the provided control to true, and
 * clears the custom error message.
 *
 * @private
 *
 * @param  {object} control
 */
ClearCustomErrorMessage.implementedBy(FormationControl).as(function () {
  if (path([NG_MODEL_CTRL, '$error', CUSTOM_ERROR_KEY], this)) {
    this[FORM_CONTROLLER].$debug(`Clearing custom error on control "${this.$getName()}".`);
    this[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, true);
    Reflect.deleteProperty(this, CUSTOM_ERROR_MESSAGE_KEY);
  }
});


/**
 * Resets the contol to an untouched, pristine state.
 *
 * @private
 *
 * @param  {object} control
 */
Reset.implementedBy(FormationControl).as(function (modelValue) {
  if (this[NG_MODEL_CTRL]) {
    this[NG_MODEL_CTRL].$setUntouched();
    this[NG_MODEL_CTRL].$setPristine();

    if (modelValue !== undefined) {
      this.setModelValue(modelValue);
    }

    this[NG_MODEL_CTRL].$validate();
  }
});


export default {
  FormationControl
};
