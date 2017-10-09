import angular from 'angular';

import {
 clone,
 find,
 forEach,
 fromPairs,
 is,
 prop,
 propEq,
 without
} from 'ramda';

import {FormGroupController} from 'components/FormGroup';
import FormationControl from 'classes/FormationControl';
import MockControl from 'classes/MockControl';

import {
  $getNextId,
  $getShowErrorsOnStr,
  $registerComponent
} from 'etc/config';

import {
  FORM_COMPONENT_NAME,
  FORM_CONTROLLER,
  FORM_GROUP_COMPONENT_NAME
} from 'etc/constants';

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
} from 'etc/interfaces';

import {
  assertType,
  applyToCollection,
  assignToScope,
  greaterScopeId,
  invoke,
  mergeDeep,
  parseFlags,
  throwError
} from 'lib';


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
 * Curried assertType.
 *
 * Remaining arguments:
 *
 * @param {string} label
 * @param {any} value
 *
 * @return {boolean}
 */
const assertIsObjectOrNil = assertType('Form', [Object, undefined]);


/**
 * Controller for the Formation form component.
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
   * @param {object|array} [data] - Optional data to delegate to members.
   */
  const applyToRegistry = (...args) => applyToCollection(registry, prop('name'), ...args);


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

    // Note: This could be replaced with an interface.
    $scope.$parent.$broadcast(BEGIN_SUBMIT_EVENT);
  }


  /**
   * Returns the form to an editable state when a submit process is complete.
   *
   * @private
   */
  function terminateSubmit () {
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
    forEach(prop => {
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

    // Ensure there is not another registered child form with the same name as
    // the form being registered.
    if (Form.getForm(childFormName)) {
      throwError(`Cannot register child form "${childFormName}"; another child form with this name already exists.`);
    }

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
   * Adds the provided control to the registry and configures it.
   *
   * @private
   *
   * @param  {object} control
   */
  RegisterControl.implementedBy(Form).as(function (control) {
    const controlName = control.name || 'control';

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
    Form[RegisterControl](new MockControl(ngModelCtrl, Form, $scope));
  });


  /**
   * Updates the form's configuration data and (re)configures each registered
   * control, child form, or child form group.
   */
  Configure.implementedBy(Form).as(function (config) {
    assertIsObjectOrNil('configuration', config);

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
    return fromPairs(applyToRegistry(GetModelValue));
  });


  /**
   * Sets the the model value(s) for each registered control, child form, or
   * child form group.
   *
   * @param  {object} newValues - Values to set.
   */
  SetModelValue.implementedBy(Form).as(function (newValues) {
    assertIsObjectOrNil('model values', newValues);

    // TODO: Document this.
    Form.model = newValues;

    // Delegate to each member's SetModelValue method.
    applyToRegistry(SetModelValue, newValues);
  });


  /**
   * Applies "$custom" errors returned from the consumer's submit handler.
   * Expects a mapping of field names to error messages or child forms.
   *
   * @private
   *
   * @param  {object} errorMessages
   */
  SetCustomErrorMessage.implementedBy(Form).as(function (errorMessages) {
    assertIsObjectOrNil('error messages', errorMessages);

    // Delegate to each member's SetCustomErrorMessage method.
    applyToRegistry(SetCustomErrorMessage, errorMessages);
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
    assertIsObjectOrNil('model values', modelValues);

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
      $transclude((compiledElement, scope) => {
        // Assign a reference to the form controller in the transclusion scope.
        // This allows users to reference the Form API from templates:
        // <div ng-if="$fm.getControl('foo').$valid"></div>
        scope.$fm = Form;

        $element.find(elementName).append(compiledElement);
      });
    }

    if (Form.$$parentForm) {
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
    // If we have a parent form or form group, we need to register with it. We
    // can 'require' both types of controllers, but we want to register with our
    // closest ancestor. Angular gives us no simple way to determine this. But,
    // we can compare each controller's scope ID; the greater of the two is
    // almost certainly guaranteed to be our closest ancestor. There may be some
    // weird edge cases here if the page is creating/destroying scopes in an
    // exotic way, but this is not likely.
    Form.$parent = greaterScopeId(Form.$$parentForm, Form.$$parentFormGroup);

    // Auto-generate a name if one was not supplied.
    Form.name = Form.name || `Form-${$getNextId()}`;

    // Merge configuration data from the "config" attribute into our local copy.
    controlConfiguration = mergeDeep(controlConfiguration, Form.$controlConfiguration);

    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      Form.$debugging = true;
    }

    if (Form.$parent) {
      // If we are a child form, register with our parent form and set up submit
      // listeners.
      Form.$parent[RegisterForm](Form);

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
      // If the user has provided an onReady callback, invoke it when the form's
      // element is ready. This happens once all child forms have been compiled
      // and a user can safely call setModelValues, for example, and be sure
      // they will propagate down to children.
      //
      // This mechanism is necessary, as opposed to using the $postLink
      // lifecycle hook in a parent controller, because if the user is using
      // ng-repeat on a <fm> element (likely in a form group) then those forms
      // will not be compiled until after the parent controller's $postLink has
      // fired.
      $element.ready(() => {
        if (is(Function, Form.$onReady)) {
          Form.$onReady(Form);
        }
      });

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
    if (Form.$parent) {
      Form.$parent.$unregisterForm(Form);
    }
  };


  // ----- Semi-Public Methods -------------------------------------------------

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
   * registration, and passed to configurable validators.
   *
   * @return {object}
   */
  Form.$getScope = () => {
    return $scope;
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
    return modelValues.get(controlName);
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
    // Any time we programatically update the model values map, we need to
    // trigger a digest cycle so that controls' ngModel getter/setters will pull
    // the new values.
    $scope.$applyAsync(() => {
      modelValues.set(controlName, clone(newValue));
    });
  };


  /**
   * Removes the provided control from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  Form.$unregisterControl = control => {
    if (registry.includes(control)) {
      Form.$debug(`Unregistering control "${control.name}".`);
      registry = without([control], registry);
    }
  };


  /**
   * Removes the provided form from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  Form.$unregisterForm = childForm => {
    if (registry.includes(childForm)) {
      Form.$debug(`Unregistering child form "${childForm.name}".`);
      registry = without([childForm], registry);
    }
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

      // [2] Prepare form and child forms for submit.
      initiateSubmit();

      // [3] Wait for async validators to finish.
      await waitForAsyncValidators();

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
      if (typeof process !== 'undefined' && (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development')) {
        Form.$debug('[Logged During Development Only]', err.message);
        throw err;
      }
    } finally {
      // [6] Restore forms to editable state. $apply is needed here because we're
      // in an async function.
      $scope.$apply(() => {
        terminateSubmit();
      });
    }
  };


  /**
   * Returns the configured error behavior for the form.
   *
   * @private
   *
   * @return {array}
   */
  Form.$getErrorBehavior = () => {
    return clone(errorBehavior);
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * Returns the first control whose name matches the provided value.
   *
   * @param  {string} controlName
   * @return {object} - Control instance.
   */
  Form.getControl = controlName => {
    const control = find(propEq('name', controlName), registry);

    if (is(FormationControl, control) || is(MockControl, control)) {
      return control;
    }
  };


  /**
   * Returns the first child form or form group whose name matches the provided
   * name.
   *
   * @param  {string} formName
   * @return {object} - Child form instance, if found.
   */
  Form.getForm = formName => {
    const form = find(propEq('name', formName), registry);

    if (is(FormController, form) || is(FormGroupController, form)) {
      return form;
    }
  };


  /**
   * Returns true if the form is disabled.
   *
   * @return {boolean}
   */
  Form.isDisabled = () => {
    return Form.$disabled || Form.$ngDisabled || (Form.$parent && Form.$parent.isDisabled());
  };


  /**
   * Disables the form and any controls that implment `isDisabled`.
   */
  Form.disable = () => {
    Form.$disabled = true;
  };


  /**
   * Enables the form and any controls that implement `isDisabled`.
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


// NOTE: This might be obsolete now that it seems to be possible to use
// circular dependencies.
FormController[FORM_CONTROLLER] = true;

FormController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$scope', '$transclude'];


$registerComponent(FORM_COMPONENT_NAME, {
  require: {
    $$parentForm: `?^^${FORM_COMPONENT_NAME}`,
    $$parentFormGroup: `?^^${FORM_GROUP_COMPONENT_NAME}`
  },
  bindings: {
    name: '@',
    $controlConfiguration: '<controls',
    $onSubmit: '<onSubmit',
    $onReady: '<onReady',
    $showErrorsOn: '@showErrorsOn',
    $ngDisabled: '<ngDisabled'
  },
  transclude: true,
  controller: FormController,
  controllerAs: 'Form'
});


export default FormController;
