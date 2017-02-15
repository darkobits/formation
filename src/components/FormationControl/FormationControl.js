// -----------------------------------------------------------------------------
// ----- Control Base Class ----------------------------------------------------
// -----------------------------------------------------------------------------

import {
  REGISTER_NG_MODEL_CALLBACK
} from '../../etc/constants';


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
   * Returns an object containing errors present on the control, or false.
   *
   * @example
   *
   * vm.myForm.getControl('name').getControlErrors() => {
   *   required: true,
   *   minLength: true
   * }
   *
   * @return {object|boolean}
   */
  getControlErrors () {
    return this[FORM_CONTROLLER].$getErrorsForControl(this.$getName());
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
    return this[FORM_CONTROLLER].$getCustomErrorMessageForControl(this.$getName());
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
    this[FORM_CONTROLLER].$setModelValue(this.$getName(), newValue);
  }
}


export default {
  FormationControl
};
