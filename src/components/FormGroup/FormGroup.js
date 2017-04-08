// -----------------------------------------------------------------------------
// ----- Form Group Component --------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import {
  $getNextId,
  $registerComponent
} from '../../etc/config';

import {
  applyToCollection,
  invoke,
  throwError
} from '../../etc/utils';

import {
  FORM_COMPONENT_NAME,
  FORM_GROUP_COMPONENT_NAME
} from '../../etc/constants';

import {
  ClearCustomErrorMessage,
  Configure,
  GetModelValue,
  RegisterForm,
  Reset,
  SetCustomErrorMessage,
  SetModelValue
} from '../../etc/interfaces';


/**
 * Key at which the Formation form controller will store a reference to the
 * Angular form controller
 *
 * @private
 *
 * @type {string}
 */
export const NG_FORM_CONTROLLER = '$ngFormController';


/**
 * Event name used to signal to child forms that a submit has begun.
 *
 * @type {string}
 */
export const BEGIN_SUBMIT_EVENT = '$fmInitiateSubmit';


/**
 * Event name used to signal to child forms that a submit has ended.
 *
 * @type {string}
 */
export const END_SUBMIT_EVENT = '$fmTerminateSubmit';


export function FormGroupController ($attrs, $compile, $element, $log, $parse, $scope, $transclude) {
  const FormGroup = this;


  /**
   * Control configuration data for the form group.
   *
   * @private
   *
   * @type {array}
   */
  let controlConfiguration = [];


  /**
   * Tracks registered child forms.
   *
   * @private
   *
   * @type {array}
   */
  let registry = [];


  // ----- Private Methods -----------------------------------------------------

  /**
   * Curried applyToCollection using our local registry and generating entries
   * using each member's index in the registry.
   *
   * Remaining arguments:
   *
   * @param {string} methodName - Method name to invoke on each member.
   * @param {object|array} [data] - Optional data to disperse to members.
   */
  const applyToRegistry = applyToCollection(registry)((m, i) => i);


  // ----- Interfaces ----------------------------------------------------------

  /**
   * Adds the provided child form to the registry and applies model values and
   * configuration.
   *
   * @private
   *
   * @param  {object} childForm
   */
  RegisterForm.implementedBy(FormGroup).as(function (childForm) {
    const childFormName = childForm.name;

    FormGroup.$debug(`Registering child form "${childFormName}".`);
    registry.push(childForm);

    // Configure the child form.
    invoke(Configure, childForm, controlConfiguration[registry.indexOf(childForm)]);
  });


  /**
   * Updates the form group's configuration data and configures each registered
   * child form.
   */
  Configure.implementedBy(FormGroup).as(function (config) {
    if (config && !R.is(Array, config)) {
      throwError(`Expected configuration to be of type "Array" but got "${typeof config}".`);
    }

    // Update our local configuration object.
    if (Array.isArray(config)) {
      controlConfiguration = config;
    }

    // Delegate to each existing member's Configure method.
    applyToRegistry(Configure, controlConfiguration);
  });


  /**
   * Returns the form group's aggregate model values by delegating to the
   * GetModelValue method of each control, child form, or child form group.
   *
   * @return {array}
   */
  GetModelValue.implementedBy(FormGroup).as(function () {
    // Map the [index, modelValuesObject] entries we get from applyToRegistry
    // into a list of modelValues objects.
    return R.map(([, modelValues]) => modelValues, applyToRegistry(GetModelValue, null));
  });


  /**
   * Sets the the model value(s) for each registered child form.
   *
   * @param  {array} newValues - Values to set.
   */
  SetModelValue.implementedBy(FormGroup).as(function (newValues) {
    if (newValues && !R.is(Array, newValues)) {
      throwError(`Form group expected model values to be of type "Array" but got "${typeof newValues}".`);
    }

    // Delegate to each child form's SetModelValue method.
    applyToRegistry(SetModelValue, newValues);
  });


  /**
   * Applies "$custom" errors returned from the consumer's submit handler.
   * Expects a mapping of field names to error messages or child forms.
   *
   * @private
   *
   * @param  {array} errorData
   */
  SetCustomErrorMessage.implementedBy(FormGroup).as(function (errorData) {
    if (errorData && !R.is(Array, errorData)) {
      throwError(`Form group expected error message data to be of type "Array" but got "${typeof errorData}".`);
    }

    // Delegate to each child form's SetCustomErrorMessage method.
    applyToRegistry(SetCustomErrorMessage, errorData);
  });


  /**
   * Clear custom error messages on all child forms.
   *
   * @private
   */
  ClearCustomErrorMessage.implementedBy(FormGroup).as(function () {
    applyToRegistry(ClearCustomErrorMessage);
  });


  /**
   * Resets each child form to a pristine state. Optionally resets the
   * model values of each child form to the provided value.
   *
   * @param  {object} [modelValues]
   */
  Reset.implementedBy(FormGroup).as(function (modelValues) {
    if (modelValues && !R.is(Array, modelValues)) {
      throwError(`Form group expected model data to be of type "Array", but got "${typeof modelValues}".`);
    }

    // Delegate to each child form's Reset method.
    applyToRegistry(Reset, modelValues);
  });


  // ----- Angular Lifecycle Hooks ---------------------------------------------

  /**
   * Determines whether to use a form or ngForm element based on whether this
   * instance has a parent form or not.
   *
   * @private
   */
  FormGroup.$postLink = () => {
    $transclude($scope.$parent.$new(), compiledElement => {
      $element.append(compiledElement);
    });
  };


  /**
   * Set up form name and assign controller instance to its name attribute.
   *
   * @private
   */
  FormGroup.$onInit = () => {
    // Auto-generate name if one was not supplied.
    FormGroup.name = FormGroup.name || `FormGroup-${$getNextId()}`;

    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      FormGroup.$debugging = true;
    }

    if (FormGroup.$parentForm) {
      // If we are a child form, register with our parent form.
      FormGroup.$parentForm[RegisterForm](FormGroup);
    } else {
      // If we are the top-level form, throw an error.
      throwError('Form groups must have a parent form.');
    }
  };


  /**
   * Handles form tear-down and cleanup.
   *
   * @private
   */
  FormGroup.$onDestroy = () => {
    if (FormGroup.$parentForm) {
      FormGroup.$parentForm.$unregisterForm(FormGroup);
    }
  };


  // ----- Semi-Private Methods ------------------------------------------------

  /**
   * Passes provided arguments to $log.log if the "debug" attribute is
   * present on the form element.
   *
   * @private
   *
   * @param  {...arglist} args
   */
  FormGroup.$debug = (...args) => {
    if (FormGroup.$debugging) {
      $log.log(`[${FormGroup.name}]`, ...args);
    }
  };


  /**
   * Returns the form group's $scope. Used to compare scope IDs for child form
   * registration, and for configurable validators.
   *
   * @return {object}
   */
  FormGroup.$getScope = () => {
    return $scope;
  };


  /**
   * Removes the provided control from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  FormGroup.$unregisterForm = childForm => {
    FormGroup.$debug(`Unregistering child form "${childForm.name}".`);
    registry = R.without(childForm, registry);
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * Similar to getControl, returns the first child form from the form registry
   * that matches the provided name.
   *
   * @param  {string} formName
   * @return {object} - Child form instance, if found.
   */
  FormGroup.getForm = formName => {
    return R.find(R.propEq('name', formName), registry);
    // return R.is(FormController, form) && form;
  };


  /**
   * Returns true if the form group is disabled.
   *
   * @return {boolean}
   */
  FormGroup.isDisabled = () => {
    return FormGroup.$disabled || FormGroup.$ngDisabled || (FormGroup.$parentForm && FormGroup.$parentForm.isDisabled());
  };


  /**
   * Disables the form and any controls that implement `isDisabled`.
   */
  FormGroup.disable = () => {
    FormGroup.$disabled = true;
  };


  /**
   * Enables the form and any controls that implement `isDisabled`.
   *
   * Note: The form may still remain disabled via `ngDisabled`.
   */
  FormGroup.enable = () => {
    FormGroup.$disabled = false;
  };


  // Expose select interfaces.
  FormGroup.configure = FormGroup[Configure];
  FormGroup.getModelValues = FormGroup[GetModelValue];
  FormGroup.reset = FormGroup[Reset];
  FormGroup.setModelValues = FormGroup[SetModelValue];
}


FormGroupController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$scope', '$transclude'];


$registerComponent(FORM_GROUP_COMPONENT_NAME, {
  require: {
    $parentForm: `?^^${FORM_COMPONENT_NAME}`
  },
  bindings: {
    name: '@',
    $ngDisabled: '<ngDisabled'
  },
  transclude: true,
  controller: FormGroupController,
  controllerAs: 'FormGroup'
});


export default FormGroupController;
