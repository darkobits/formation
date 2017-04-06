// -----------------------------------------------------------------------------
// ----- Form Component --------------------------------------------------------
// -----------------------------------------------------------------------------

import angular from 'angular';
import R from 'ramda';

import {
  $getNextId,
  $getShowErrorsOnStr,
  $registerComponent
} from '../../etc/config';

import {
  applyToCollection,
  assignToScope,
  greaterScopeId,
  invoke,
  mergeDeep,
  parseFlags,
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
  RegisterControl,
  RegisterForm,
  RegisterNgForm,
  RegisterNgModel,
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


/**
 * @module FormController
 *
 * @description
 *
 * The controller for Formation `<fm></fm>` components.
 *
 * This component has the following bindings:
 *
 * - `name`: Name of the form, and scope value to assign controller reference
 *   to. (Ex: `vm.myForm`)
 * - `controls`: Object containing control names and configuration. (Ex:
 *   `vm.controlConfig`)
 * - `on-submit`: Function to invoke when the form is submitted. (Ex:
 *   `vm.onSubmit`)
 * - `ng-disabled`: Expression to evaluate that, if truthy, will disable all
 *   Formation controls in the form.
 */
export function FormController ($attrs, $compile, $element, $log, $parse, $scope, $transclude) {
  const Form = this;


  /**
   * Counter for getNextId(). This is used to assign unique IDs to controls
   * within the form.
   *
   * @private
   *
   * @type {number}
   */
  let counter = -1;


  /**
   * Configured error behavior for the form.
   *
   * @private
   *
   * @type {array}
   */
  let errorBehavior = [];


  /**
   * Control configuration data for this form and possible child forms.
   *
   * @private
   *
   * @type {object}
   */
  let controlConfiguration = {};


  /**
   * Tracks registered controls and child forms.
   *
   * @private
   *
   * @type {array}
   */
  let registry = [];


  /**
   * Tracks model values for each control.
   *
   * @private
   *
   * @type {Object}
   */
  const modelValues = new Map();


  // ----- Private Methods -----------------------------------------------------

  /**
   * Curried applyToCollection using our local registry and generating entries
   * using each member's 'name' property.
   *
   * Remaining arguments:
   *
   * @param {string} methodName - Method name to invoke on each member.
   * @param {object|array} [data] - Optional data to disperse to members.
   */
  const applyToRegistry = applyToCollection(registry)(R.prop('name'));


  /**
   * Curried assignToScope that will assign the form controller instance to the
   * provided expression in the controller's parent scope.
   *
   * Remaining arguments:
   *
   * @param {string} expression - Expression to assign to.
   */
  const assignName = assignToScope($parse)($scope.$parent)(Form);


  /**
   * Returns the next available ID.
   *
   * @private
   *
   * @return {number}
   */
  function getNextId () {
    return ++counter;
  }


  /**
   * Wraps an ngModel controller instance in a mock control instance, allowing
   * users to use ngModel outside of Formation controls.
   *
   * @example
   *
   * <fm name="vm.myForm">
   *   <input type="text"
   *     name="email"
   *     ng-model="vm.email">
   * </fm>
   *
   * @private
   *
   * @param  {object} ngModelCtrl
   * @return {object}
   */
  function createMockInputControl (ngModelCtrl) {
    const controlName = ngModelCtrl.$name;

    // We don't know what this control's ngModel expression is bound to, so in
    // order to keep it in sync we need to watch it and update our internal
    // model value when it changes.
    const cancelWatcher = $scope.$watch(() => ngModelCtrl.$modelValue, newValue => {
      Form.$setModelValue(controlName, newValue);
    });

    $scope.$on('$destroy', cancelWatcher);

    return {
      name: controlName,
      $ngModelCtrl: ngModelCtrl,
      [GetModelValue] () {
        return Form.$getModelValue(controlName);
      },
      [SetModelValue] () { }
    };
  }


  /**
   * Returns a promise that resolves when the Angular form controller's
   * "$pending" flag becomes false.
   *
   * @private
   *
   * @return {promise}
   */
  function waitForAsyncValidators () {
    return new Promise(resolve => {
      const watchExpression = `Form.${NG_FORM_CONTROLLER}.$pending`;

      const cancelWatcher = $scope.$watch(watchExpression, isPending => {
        if (!isPending) {
          cancelWatcher();
          resolve();
        }
      });
    });
  }


  /**
   * Sets related form attributes to the correct state for submitting.
   *
   * @private
   */
  function initiateSubmit () {
    Form[ClearCustomErrorMessage]();

    Form[NG_FORM_CONTROLLER].$setSubmitted(true);
    Form.$submitting = true;
    Form.disable();

    // TODO: This could be replaced with an interface.
    $scope.$parent.$broadcast(BEGIN_SUBMIT_EVENT);
  }


  /**
   * Returns the form to an editable state when a submit process is complete.
   *
   * @private
   */
  function terminateSubmit () {
    // Form.$debug('Broadcasting END_SUBMIT on $scope:', $scope.$parent);
    Form.$submitting = false;
    Form.enable();
    $scope.$parent.$broadcast(END_SUBMIT_EVENT);
  }


  // ----- Interfaces ----------------------------------------------------------

  /**
   * Implement a callback that decorated form/ngForm directives will use to
   * register with this controller.
   *
   * @private
   *
   * @param {object} ngFormController - Form/ngForm controller instance.
   */
  RegisterNgForm.implementedBy(Form).as(function (ngFormController) {
    if (Form[NG_FORM_CONTROLLER]) {
      throwError('ngForm already registered with Formation.');
    }

    Form[NG_FORM_CONTROLLER] = ngFormController;

    // Expose common Angular form controller properties.
    R.forEach(prop => {
      Reflect.defineProperty(Form, prop, {
        get: () => Form[NG_FORM_CONTROLLER][prop]
      });
    }, ['$dirty', '$invalid', '$pending', '$pristine', '$submitted', '$valid']);
  });


  /**
   * Adds the provided child form to the registry and applies model values and
   * configuration.
   *
   * @private
   *
   * @param  {object} childForm
   */
  RegisterForm.implementedBy(Form).as(function (childForm) {
    const childFormName = childForm.name;

    // Ensure there is not a registered control with the same name as the form
    // being registered.
    if (Form.getControl(childFormName)) {
      throwError(`Cannot register child form "${childFormName}"; a control with this name already exists.`);
    }

    Form.$debug(`Registering child form "${childFormName}".`);
    registry.push(childForm);

    // Configure the child form/form group.
    invoke(Configure, childForm, controlConfiguration[childFormName]);
  });


  /**
   * Adds the provided control to the registry and applies configuration.
   *
   * @private
   *
   * @param  {object} control
   */
  RegisterControl.implementedBy(Form).as(function (control) {
    const controlName = control.name;

    // Ensure there is not a registered child form with the same name as the
    // control being registered.
    if (Form.getForm(controlName)) {
      throwError(`Cannot register control "${controlName}"; a child form with this name already exists.`);
    }

    Form.$debug(`Registering control "${controlName}".`);

    // Controls need unique IDs, as radio buttons will share the same name.
    control.$uid = `${controlName}-${getNextId()}`;

    registry.push(control);

    // Configure the control.
    invoke(Configure, control, controlConfiguration[controlName]);
  });


  /**
   * Implement a callback that decorated ngModel directives will use to register
   * with this controller. This is used primarily to support instances of
   * ngModel used in a Formation form without a Formation control.
   *
   * @private
   *
   * @param  {object} ngModelCtrl
   */
  RegisterNgModel.implementedBy(Form).as(function (ngModelCtrl) {
    Form[RegisterControl](createMockInputControl(ngModelCtrl));
  });


  /**
   * Updates the form's configuration data and configures each registered
   * control, child form, or child form group.
   */
  Configure.implementedBy(Form).as(function (config) {
    if (config && !R.is(Object, config)) {
      throwError(`Form expected configuration to be of type "Object" but got "${typeof config}".`);
    }

    // Update our local configuration object so that controls can pull from it
    // as they come online.
    controlConfiguration = mergeDeep(controlConfiguration, config);

    // Delegate to each existing member's Configure method.
    applyToRegistry(Configure, controlConfiguration);
  });


  /**
   * Returns the form's aggregate model values by delegating to the
   * GetModelValue method of each control, child form, or child form group.
   *
   * @return {object}
   */
  GetModelValue.implementedBy(Form).as(function () {
    return R.fromPairs(applyToRegistry(GetModelValue, null));
    // return R.fromPairs(toPairsWith(R.prop('name'), R.partial(invoke, [GetModelValue]), registry));
  });


  /**
   * Sets the the model value(s) for each registered control, child form, or
   * child form group.
   *
   * @param  {object} newValues - Values to set.
   */
  SetModelValue.implementedBy(Form).as(function (newValues) {
    if (newValues && !R.is(Object, newValues)) {
      throwError(`Form expected model values to be of type "Object" but got "${typeof newValues}".`);
    }

    // Delegate to each member's SetModelValue method.
    applyToRegistry(SetModelValue, newValues);
  });


  /**
   * Applies "$custom" errors returned from the consumer's submit handler.
   * Expects a mapping of field names to error messages or child forms.
   *
   * @private
   *
   * @param  {object} errorData
   */
  SetCustomErrorMessage.implementedBy(Form).as(function (errorData) {
    if (errorData && !R.is(Object, errorData)) {
      throwError(`Form expected error message data to be of type "Object" but got "${typeof errorData}".`);
    }

    // Delegate to each member's SetCustomErrorMessage method.
    applyToRegistry(SetCustomErrorMessage, errorData);
  });


  /**
   * Clear custom error messages on all registered controls, child forms, and
   * child form groups that also implement ClearCustomErrorMessage.
   *
   * @private
   */
  ClearCustomErrorMessage.implementedBy(Form).as(function () {
    applyToRegistry(ClearCustomErrorMessage);
  });


  /**
   * Resets each control and the form to a pristine state. Optionally resets the
   * model value of each control to the provided value, and validates all
   * controls.
   *
   * @param  {object} [modelValues]
   */
  Reset.implementedBy(Form).as(function (modelValues) {
    if (modelValues && !R.is(Object, modelValues)) {
      throwError(`Form expected model data to be of type "Object", but got "${typeof modelValues}".`);
    }

    Form[NG_FORM_CONTROLLER].$setPristine();

    // Delegate to each member's Reset method, passing related model value data.
    applyToRegistry(Reset, modelValues);
  });


  // ----- Angular Lifecycle Hooks ---------------------------------------------

  /**
   * Determines whether to use a form or ngForm element based on whether this
   * instance has a parent form or not.
   *
   * @private
   */
  Form.$postLink = () => {
    function transclude (template) {
      const elementName = angular.element(template)[0].tagName;

      // Compile our template using our isolate scope and append it to our element.
      $compile(template)($scope, compiledElement => {
        $element.append(compiledElement);
      });

      // Handle transcluded content from the user by appending it to the above
      // form/ngForm template and using a new scope that inherits from our outer
      // scope, mimicing the default Angular behavior.
      $transclude($scope.$parent.$new(), compiledElement => {
        $element.find(elementName).append(compiledElement);
      });
    }

    if (Form.$parentForm) {
      transclude(`
        <ng-form></ng-form>
      `);
    } else {
      transclude(`
        <form novalidate
          ng-submit="Form.$submit()"
          ng-model-options="{getterSetter: true}">
        </form>
      `);
    }
  };


  /**
   * Set up form name and assign controller instance to its name attribute.
   *
   * @private
   */
  Form.$onInit = () => {
    const parent = greaterScopeId(Form.$parentForm, Form.$parentFormGroup);

    // Auto-generate name if one was not supplied.
    Form.name = Form.name || `Form-${$getNextId()}`;

    // Merge configuration data from the "config" attribute into our local copy.
    controlConfiguration = mergeDeep(controlConfiguration, Form.$controlConfiguration);

    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      Form.$debugging = true;
    }

    if (parent) {
      // If we are a child form, register with our parent form and set up submit
      // listeners.
      parent[RegisterForm](Form);

      $scope.$on(BEGIN_SUBMIT_EVENT, () => {
        if (!Form.$submitting) {
          initiateSubmit();
        }
      });

      $scope.$on(END_SUBMIT_EVENT, () => {
        if (Form.$submitting) {
          terminateSubmit();
        }
      });
    } else {
      // If we are the top-level form, assign to parent scope expression.
      assignName(Form.name);
    }

    // Parse error behavior.
    errorBehavior = parseFlags(Form.$showErrorsOn || $getShowErrorsOnStr());
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
  Form.$onChanges = changes => {
    // Handle changes to name.
    if (changes.name && !changes.name.isFirstChange()) {
      const {currentValue, previousValue} = changes.name;
      Form.$debug(`Name changed from "${previousValue}" to "${currentValue}".`);
      assignName(currentValue);
    }

    if (changes.$showErrorsOn && !changes.$showErrorsOn.isFirstChange()) {
      const {currentValue} = changes.$showErrorsOn;
      errorBehavior = parseFlags(currentValue || $getShowErrorsOnStr());
    }
  };


  /**
   * Handles form tear-down and cleanup.
   *
   * @private
   */
  Form.$onDestroy = () => {
    if (Form.$parentForm) {
      Form.$parentForm.$unregisterForm(Form);
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
  Form.$debug = (...args) => {
    if (Form.$debugging) {
      $log.log(`[${Form.name}]`, ...args);
    }
  };


  /**
   * Returns the form's $scope. Used to compare scope IDs for child form
   * registration, and for configurable validators.
   *
   * @return {object}
   */
  Form.$getScope = () => {
    return $scope;
  };


  /**
   * Returns true if the form should be disabled.
   *
   * @private
   *
   * @return {boolean}
   */
  Form.$isDisabled = () => {
    return Form.$disabled || Form.$ngDisabled || (Form.$parentForm && Form.$parentForm.$isDisabled());
  };


  /**
   * Returns a copy of the model value for the named control.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {*}
   */
  Form.$getModelValue = controlName => {
    return R.clone(modelValues.get(controlName));
  };


  /**
   * Sets the model value for the named control to a copy of the provided value.
   *
   * @private
   *
   * @param  {string} controlName
   * @param  {*} newValue
   */
  Form.$setModelValue = (controlName, newValue) => {
    modelValues.set(controlName, R.clone(newValue));
  };


  /**
   * Removes the provided control from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  Form.$unregisterControl = control => {
    Form.$debug(`Unregistering control "${control.name}".`);
    registry = R.reject(R.propEq('$uid', control.$uid), registry);
  };


  /**
   * Removes the provided control from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  Form.$unregisterForm = childForm => {
    Form.$debug(`Unregistering child form "${childForm.name}".`);
    registry = R.reject(R.propEq('name', childForm.name), registry);
  };


  /**
   * Handles form submission.
   *
   * Once all validators have finished, clears all custom errors and then
   * checks the form's validity. If valid, calls the consumer's submit handler
   * passing an object representing each control's current model value.
   *
   * If the consumer returns an object (typically from a `.catch()`) it will be
   * assumed to be a map of control names and error messages, which will be
   * applied to each control in the map.
   *
   * @private
   */
  Form.$submit = async () => {
    try {
      // [1] Ensure a submit is not already underway.
      if (Form.$submitting) {
        Form.$debug('Submit already in progress.');
        throw new Error('SUBMIT_IN_PROGRESS');
      }

      // [2] Wait for async validators to finish.
      await waitForAsyncValidators();

      // [3] Prepare form and child forms for submit.
      initiateSubmit();

      // [4] If the form is (still) invalid, bail.
      if (Form[NG_FORM_CONTROLLER].$invalid) {
        throw new Error('NG_FORM_INVALID');
      }

      // [5] If the consumer provided a submit handler, invoke it and assume its
      // return value is custom error messages to apply to controls.
      if (typeof Form.$onSubmit === 'function') {
        // Invoke the consumer's onSubmit callback with current model data.
        const customErrors = await Promise.resolve(Form.$onSubmit(Form.getModelValues()));
        Form[SetCustomErrorMessage](customErrors);
      }
    } catch (err) {
      // Re-throw errors when testing so we know what caused the submit to fail.
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
        Form.$debug('[Logged During Development Only]', err);
      }
    }

    // [6] Restore forms to editable state.
    $scope.$apply(() => {
      terminateSubmit();
    });
  };


  Form.$getErrorBehavior = () => {
    return R.clone(errorBehavior);
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * Returns the first control whose name matches the provided value.
   *
   * @param  {string} controlName
   * @return {object} - Control instance.
   */
  Form.getControl = controlName => {
    const control = R.find(R.propEq('name', controlName), registry);
    return !R.is(FormController, control) && control;
  };


  /**
   * Similar to getControl, returns the first child form from the form registry
   * that matches the provided name.
   *
   * @param  {string} formName
   * @return {object} - Child form instance, if found.
   */
  Form.getForm = formName => {
    const form = R.find(R.propEq('name', formName), registry);
    return R.is(FormController, form) && form;
  };


  /**
   * Disables the form and any controls that use `$isDisabled`.
   */
  Form.disable = () => {
    Form.$disabled = true;
  };


  /**
   * Enables the form and any controls that use `$isDisabled`.
   *
   * Note: The form may still remain disabled via `ngDisabled`.
   */
  Form.enable = () => {
    Form.$disabled = false;
  };


  // Expose select interfaces to the public API.
  Form.configure = Form[Configure];
  Form.getModelValues = Form[GetModelValue];
  Form.reset = Form[Reset];
  Form.setModelValues = Form[SetModelValue];
}


FormController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$scope', '$transclude'];


$registerComponent(FORM_COMPONENT_NAME, {
  require: {
    $parentForm: `?^^${FORM_COMPONENT_NAME}`,
    $parentFormGroup: `?^^${FORM_GROUP_COMPONENT_NAME}`
  },
  bindings: {
    name: '@',
    $controlConfiguration: '<controls',
    $onSubmit: '<onSubmit',
    $showErrorsOn: '@showErrorsOn',
    $ngDisabled: '<ngDisabled'
  },
  transclude: true,
  controller: FormController,
  controllerAs: 'Form'
});


export default FormController;
