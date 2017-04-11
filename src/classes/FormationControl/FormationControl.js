// -----------------------------------------------------------------------------
// ----- Control Base Class ----------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import {
  ConfigurableValidator
} from '../../classes/ConfigurableValidator';

import {
  COMPONENT_CONFIGURATION,
  CUSTOM_ERROR_KEY,
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  mergeDeep,
  throwError
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


  // ----- Semi-Private Methods ------------------------------------------------

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
    return this.$getControl().getControlId();
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
      this[SetModelValue](newValue);
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
    const ngModelCtrl = this.$getControl()[NG_MODEL_CTRL];
    const errorBehavior = this[FORM_CONTROLLER].$getErrorBehavior();

    // If the control is valid, return.
    if (ngModelCtrl.$valid) {
      return false;
    }

    // If the user did not configure error behavior, return the control's errors
    // if it is invalid.
    if (R.isNil(errorBehavior) || errorBehavior === '') {
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


  /**
   * Expose our GetModelValue implementation.
   */
  getModelValue () {
    return this[GetModelValue]();
  }


  /**
   * Expose our SetModelValue implementation.
   */
  setModelValue (newValue) {
    this[SetModelValue](newValue);
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
      if (R.has(name, this[NG_MODEL_CTRL].$validators)) {
        // Validator with same key already exists on this control, pass.
        return;
      } else if (R.is(ConfigurableValidator, validator)) {
        this[NG_MODEL_CTRL].$validators[name] = validator.configure(this);
      } else if (R.is(Function, validator)) {
        this[NG_MODEL_CTRL].$validators[name] = validator.bind(this[NG_MODEL_CTRL]);
      } else {
        throwError(`Expected validator to be of type "Function", but got "${typeof validator}".`);
      }
    }, validators);
  }


  // Set up asyncronous validators.
  if (R.is(Object, asyncValidators)) {
    R.mapObjIndexed((asyncValidator, name) => {
      if (R.has(name, this[NG_MODEL_CTRL].$asyncValidators)) {
        // Validator with same key already exists on this control, pass.
        return;
      } else if (R.is(ConfigurableValidator, asyncValidator)) {
        this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator.configure(this);
      } else if (R.is(Function, asyncValidator)) {
        this[NG_MODEL_CTRL].$asyncValidators[name] = asyncValidator.bind(this[NG_MODEL_CTRL]);
      } else {
        throwError(`Expected async validator to be of type "Function", but got "${typeof asyncValidator}".`);
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
 * Sets the control's model value.
 *
 * @example
 *
 * vm.myForm.getControl('name').setModelValue('Frodo');
 *
 * @param  {*} newValue - Value to set.
 */
SetModelValue.implementedBy(FormationControl).as(function (newValue) {
  this[FORM_CONTROLLER].$setModelValue(this.$getName(), R.clone(newValue));
});


/**
 * Formerly: $setCustomError
 *
 * Sets a custom error on the control and sets the "custom" validity state to
 * false.
 *
 * @private
 *
 * @param  {string} errorMessage
 */
SetCustomErrorMessage.implementedBy(FormationControl).as(function (errorMessage) {
  if (errorMessage) {
    if (!R.is(String, errorMessage)) {
      throwError(`Expected error message to be of type "String" but got "${typeof errorMessage}".`);
    }

    this[FORM_CONTROLLER].$debug(`Setting custom error "${errorMessage}" on control "${this.$getName()}".`);
    this[CUSTOM_ERROR_MESSAGE_KEY] = errorMessage;
    this[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, false);
  }
});


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
ClearCustomErrorMessage.implementedBy(FormationControl).as(function () {
  if (R.path([NG_MODEL_CTRL, '$error', CUSTOM_ERROR_KEY], this)) {
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
