// -----------------------------------------------------------------------------
// ----- Form Group Component --------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';
import app from '../../app';

import {
  invoke,
  mergeEntries,
  throwError,
  toPairsWith
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


export function FormGroupController ($attrs, $compile, $element, $log, $parse, $scope, $transclude, Formation) {
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
   * Assigns the form group instance to the parsed expression in the parent
   * scope.
   *
   * @private
   *
   * @param  {string} expression
   */
  function assignToExpression (expression) {
    let setter;

    if (expression === '') {
      setter = $parse('this[""]').assign;
    } else {
      setter = $parse(expression).assign;
    }

    setter($scope.$parent, FormGroup);
  }


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
    R.forEach(([, delegate, config]) => {
      invoke(Configure, delegate, config);
    }, mergeEntries(toPairsWith(R.prop('name'), registry), Object.entries(controlConfiguration || [])));
  });


  /**
   * Returns the form group's aggregate model values by delegating to the
   * GetModelValue method of each control, child form, or child form group.
   *
   * @return {array}
   */
  GetModelValue.implementedBy(FormGroup).as(function () {
    return R.map(R.partial(invoke, [GetModelValue]), registry);
  });


  /**
   * Sets the the model value(s) for each registered child form.
   *
   * @param  {array} newValues - Values to set.
   */
  SetModelValue.implementedBy(FormGroup).as(function (newValues) {
    if (newValues && !R.is(Array, newValues)) {
      throwError(`Expected model values to be of type "Array" but got "${typeof newValues}".`);
    }

    console.log('FORM GROUP MODEL VALUES', newValues);

    // Delegate to each child form's SetModelValue method.
    R.forEach(([, delegate, modelValues]) => {
      invoke(SetModelValue, delegate, modelValues);
    }, mergeEntries(Object.entries(registry), Object.entries(newValues || [])));
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
      throwError(`Expected error message data to be of type "Array" but got "${typeof errorData}".`);
    }

    // Delegate to each child form's SetCustomErrorMessage method.
    R.forEach(([, delegate, errorData]) => {
      invoke(SetCustomErrorMessage, delegate, errorData);
    }, mergeEntries(Object.entries(registry), Object.entries(errorData || [])));
  });


  /**
   * Clear custom error messages on all child forms.
   *
   * @private
   */
  ClearCustomErrorMessage.implementedBy(FormGroup).as(function () {
    R.forEach(member => {
      invoke(ClearCustomErrorMessage, member);
    }, registry);
  });


  /**
   * Resets each child form to a pristine state. Optionally resets the
   * model values of each child form to the provided value.
   *
   * @param  {object} [modelValues]
   */
  Reset.implementedBy(FormGroup).as(function (modelValues) {
    if (modelValues && !R.is(Array, modelValues)) {
      throwError(`Expected model data to be of type "Array", but got "${typeof modelValues}".`);
    }

    // Delegate to each child form's Reset method.
    R.forEach(([, delegate, modelValues]) => {
      invoke(Reset, delegate, modelValues);
    }, mergeEntries(Object.entries(registry), Object.entries(modelValues || [])));
  });


  // ----- Semi-Private Methods ------------------------------------------------

  FormGroup.$getScopeId = () => {
    return $scope.$id;
  };

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
    FormGroup.name = FormGroup.name || `FormGroup-${Formation.$getNextId()}`;

    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      FormGroup.$debugging = true;
    }

    if (FormGroup.$parentForm) {
      // If we are a child form, register with our parent form.
      FormGroup.$parentForm[RegisterForm](FormGroup);
    } else {
      // If we are the top-level form, assign to parent scope expression.
      assignToExpression(FormGroup.name);
    }
  };


  /**
   * Handle changes to bindings.
   *
   * Note: This will only report reassignment to bindings, it will not
   * deep-watch bound objects.
   *
   * @private
   *
   * @param  {object} changes
   */
  FormGroup.$onChanges = changes => {
    // Handle changes to name.
    if (changes.name && !changes.name.isFirstChange()) {
      const {currentValue, previousValue} = changes.name;
      FormGroup.$debug(`Name changed from "${previousValue}" to "${currentValue}".`);
      assignToExpression(currentValue);
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


  /**
   * Returns true if the form should be disabled.
   *
   * @private
   *
   * @return {boolean}
   */
  FormGroup.$isDisabled = () => {
    return FormGroup.$disabled || FormGroup.$ngDisabled || (FormGroup.$parentForm && FormGroup.$parentForm.$isDisabled());
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
   * Disables the form and any controls that use `$isDisabled`.
   */
  FormGroup.disable = () => {
    FormGroup.$disabled = true;
  };


  /**
   * Enables the form and any controls that use `$isDisabled`.
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


FormGroupController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$scope', '$transclude', 'Formation'];


app.run(Formation => {
  Formation.$registerComponent(FORM_GROUP_COMPONENT_NAME, {
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
});


export default FormGroupController;
