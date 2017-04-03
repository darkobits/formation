// -----------------------------------------------------------------------------
// ----- Form Component --------------------------------------------------------
// -----------------------------------------------------------------------------

import angular from 'angular';
import R from 'ramda';
import app from '../../app';

import {
  mergeDeep,
  throwError
} from '../../etc/utils';

import {
  APPLY_CONFIGURATION,
  FORM_COMPONENT_NAME,
  REGISTER_FORM_CALLBACK,
  REGISTER_NG_MODEL_CALLBACK
} from '../../etc/constants';


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
export function FormController ($attrs, $compile, $element, $log, $parse, $q, $scope, $transclude, Formation) {
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
   * Control configuration data for this form and possible child forms.
   *
   * @private
   *
   * @type {object}
   */
  let controlConfiguration = {};


  /**
   * Tracks registered controls.
   *
   * @private
   *
   * @type {Array}
   */
  let controlRegistry = [];


  /**
   * Tracks registered child forms.
   *
   * @private
   *
   * @type {Array}
   */
  let formRegistry = [];


  /**
   * Tracks model values for each control.
   *
   * @private
   *
   * @type {Object}
   */
  const modelValues = {};


  // ----- Private Methods -----------------------------------------------------

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
   * Assigns the controller instance to the parsed expression in the parent
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

    setter($scope.$parent, Form);
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
      getModelValue () {
        return Form.$getModelValue(controlName);
      },
      setModelValue () { }
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
   * Accepts a comma/space-delimited list of strings and returns an array of
   * $-prefixed strings.
   *
   * @example
   *
   * "touched, submitted" => ['$touched', '$submitted']
   *
   * @private
   *
   * @param  {string} string
   * @return {array}
   */
  function parseFlags (string) {
    if (!string || string === '') {
      return;
    }

    const states = R.map(state => {
      return state.length && `$${state.replace(/[, ]/g, '')}`;
    }, String(string).split(' '));

    return R.filter(R.identity, states);
  }


  /**
   * Applies each registered control to the provided function.
   *
   * TODO: Make this more generic to support child forms. mapRegistry?
   *
   * @private
   *
   * @param  {function} fn
   * @return {object}
   */
  function mapControls (fn) {
    return R.map(control => fn(control), controlRegistry);
  }


  /**
   * Sets related form attributes to the correct state for submitting.
   *
   * @private
   */
  function initiateSubmit () {
    // We need to clear all custom errors set from the last submission in
    // order for the form's $valid flag to be true so we can proceed.
    mapControls(control => {
      if (!control.$clearCustomError) {
        console.warn('This control doesnt have a clearcustom error function:', control);
      } else {
        control.$clearCustomError();
      }
    });

    // Form.$debug('Broadcasting BEGIN_SUBMIT on $scope:', $scope.$parent);
    Form[NG_FORM_CONTROLLER].$setSubmitted(true);
    Form.$submitting = true;
    Form.disable();

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


  // ----- Semi-Private Methods ------------------------------------------------

  /**
   * Implement a callback that decorated form/ngForm directives will use to
   * register with this controller.
   *
   * @private
   *
   * @param {object} ngFormController - Form/ngForm controller instance.
   */
  Form[REGISTER_FORM_CALLBACK] = ngFormController => {
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
  };


  /**
   * Implement a callback that decorated ngModel directives will use to register
   * with this controller. This is used primarily to support instances of
   * ngModel used in a Formation form without a Formation control.
   *
   * @param  {object} ngModelController
   */
  Form[REGISTER_NG_MODEL_CALLBACK] = ngModelController => {
    Form.$registerControl(createMockInputControl(ngModelController));
  };


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
    // Auto-generate name if one was not supplied.
    Form.name = Form.name || `Form-${Formation.$getNextId()}`;

    // Merge configuration data from the "config" attribute into our local copy.
    controlConfiguration = mergeDeep(controlConfiguration, Form.$controlConfiguration);

    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      Form.$debugging = true;
    }

    if (Form.$parentForm) {
      // If we are a child form, register with our parent form and set up submit
      // listeners.
      Form.$parentForm.$registerForm(Form);

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
      assignToExpression(Form.name);
    }

    // Parse error behavior.
    // TODO: Swap this so that local show-errors-on supercedes global config.
    Form.showErrorsOn = parseFlags(Formation.$getShowErrorsOnStr() || Form.$showErrorsOn);
    Form.$debug('Using show error scheme:', Form.showErrorsOn);
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
      assignToExpression(currentValue);
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
   * Returns the model value for the named control.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {*}
   */
  Form.$getModelValue = controlName => {
    return modelValues[controlName];
  };


  /**
   * Sets the model value for the named control to the provided value.
   *
   * @private
   *
   * @param  {string} controlName
   * @param  {*} newValue
   */
  Form.$setModelValue = (controlName, newValue) => {
    modelValues[controlName] = newValue;
  };


  /**
   * Adds the provided control to the registry and applies configuration.
   *
   * @private
   *
   * @param  {object} control
   */
  Form.$registerControl = control => {
    const controlName = control.name;

    // Ensure there is not a registered child form with the same name as the
    // control being registered.
    if (Form.getForm(controlName)) {
      throwError(`Cannot register control "${controlName}"; a child form with this name already exists.`);
    }

    Form.$debug(`Registering control "${controlName}".`);
    control.$uid = `${name}-${getNextId()}`;
    controlRegistry = R.append(control, controlRegistry);

    // Determine if we have any form-level configuration for this control.
    const config = controlConfiguration[controlName];

    // If so, apply its configuration.
    if (config) {
      control[APPLY_CONFIGURATION](config);
    }
  };


  /**
   * Adds the provided form to the registry and applies model values and
   * configuration.
   *
   * @private
   *
   * @param  {object} form
   */
  Form.$registerForm = childForm => {
    const childFormName = childForm.name;

    // Ensure there is not a registered control with the same name as the form
    // being registered.
    if (Form.getControl(childFormName)) {
      throwError(`Cannot register child form "${childFormName}"; a control with this name already exists.`);
    }

    Form.$debug(`Registering child form "${childFormName}".`);
    formRegistry = R.append(childForm, formRegistry);

    // Determine if we have any form configuration for the child form.
    const config = controlConfiguration[childFormName];

    // If so, apply its configuration.
    if (config) {
      childForm.configure(config);
    }
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
    controlRegistry = R.reject(R.propEq('$uid', control.$uid), controlRegistry);
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
    formRegistry = R.reject(R.propEq('name', childForm.name), formRegistry);
  };


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
        Form.$applyCustomErrors(customErrors);
      }
    } catch (err) {
      // Re-throw errors when testing so we know what caused the submit to fail.
      if (true || typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        Form.$debug('[Logged During Development Only]', err);
      }
    }

    // [6] Restore forms to editable state.
    $scope.$apply(() => {
      terminateSubmit();
    });
  };


  /**
   * Applies "$custom" errors returned from the consumer's submit handler.
   * Expects a mapping of field names to error messages or child forms.
   *
   * TODO: Make this a more abstract interaction with a "registry" that can be
   * done from mapControls, which will make it easier to delegate field errors
   * to child forms.
   *
   * @private
   *
   * @param  {object} customErrors
   */
  Form.$applyCustomErrors = customErrors => {
    if (R.is(Object, customErrors)) {
      R.forEach(error => {
        const [controlOrFormName, messageOrObject] = error;
        const control = Form.getControl(controlOrFormName);
        const childForm = Form.getForm(controlOrFormName);

        if (control && R.is(String, messageOrObject)) {
          control.$setCustomError(messageOrObject);
        } else if (childForm && R.is(Object, messageOrObject)) {
          childForm.$applyCustomErrors(messageOrObject);
        } else {
          throwError('Unsure what to do with custom error object fragment:', messageOrObject);
        }
      }, Object.entries(customErrors));
    }
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * @alias module:FormController.getControl
   *
   * @description
   *
   * Returns the first control whose name matches the provided value.
   *
   * @param  {string} controlName
   * @return {object} - Control instance.
   */
  Form.getControl = controlName => {
    return R.find(R.propEq('name', controlName), controlRegistry);
  };


  /**
   * Similar to getControl, returns the first child form from the form registry
   * that matches the provided name.
   *
   * @param  {string} formName
   * @return {object} - Child form instance, if found.
   */
  Form.getForm = formName => {
    return R.find(R.propEq('name', formName), formRegistry);
  };


  /**
   * Accepts a control configuration object and applies it to each control in
   * the form.
   *
   * TODO: Add $onChanges support for this.
   *
   * @param  {object} formConfiguration
   */
  Form.configure = config => {
    // [1] Update out local configuration object.
    controlConfiguration = mergeDeep(controlConfiguration, config);

    // [2] Apply configuration to any existing registered controls and child
    // forms.
    R.forEach((controlOrFormName, config) => {
      const control = Form.getControl(controlOrFormName);
      const childForm = Form.getForm(controlOrFormName);

      if (control) {
        // THIS HAS MOVED TO CONTROL CLASS, BUT MERGE FORM-LEVEL CONFIG WITH IT FIRST
        control[APPLY_CONFIGURATION](config);
      } else if (childForm) {
        childForm.configure(config);
      }
    }, Object.entries(controlConfiguration));
  };


  /**
   * @function getModelValues
   * @memberOf FormController
   * @instance
   *
   * @description
   *
   * Returns a new object containing the current non-`null` and non-`undefined`
   * model values for each registered control. This is the same method used to
   * generate model values that are passed to submit handlers.
   *
   * @return {object} - Map of control names to model values.
   */
  Form.getModelValues = () => {
    // Find a better way to map over a "registry" (collection) and build an
    // object with values consisting of calling a function on each member of the
    // registry.
    const childFormModelValues = R.fromPairs(R.map(childForm => {
      return [childForm.name, childForm.getModelValues()];
    }, formRegistry));

    // Model values for the local form.
    const localModelValues = R.reject(modelValue => {
      return R.isNil(modelValue) || modelValue === '';
    }, modelValues);

    return mergeDeep(childFormModelValues, localModelValues);
  };


  /**
   * @description
   *
   * Sets the model value of each control to the provided value.
   *
   * @example
   *
   * $http.get('/api/someData').then(response => {
   *   // response = {data: {name: 'Rick', occupation: 'Scientist'}}
   *   vm.myForm.setModelValues(response.data);
   * });
   *
   * @param  {object} modelValues - Map of control names to model values.
   */
  Form.setModelValues = modelValues => {
    if (R.is(Object, modelValues)) {
      R.forEach(([controlOrFormName, modelData]) => {
        const control = Form.getControl(controlOrFormName);
        const childForm = Form.getForm(controlOrFormName);

        if (control) {
          Form.$setModelValue(controlOrFormName, modelData);
        } else if (childForm && R.is(Object, modelData)) {
          childForm.setModelValues(modelData);
        } else {
          throwError('Unsure what to do with model data fragment:', modelData);
        }
      }, Object.entries(R.clone(modelValues)));
    }
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


  /**
   * Resets each control and the form to a pristine state. Optionally resets the
   * model value of each control to the provided value, and validates all
   * controls.
   *
   * TODO: This needs to support child forms. (better)
   *
   * @example
   *
   * vm.myForm.reset({
   *   name: null,
   *   email: null
   * });
   *
   * @param  {object} [modelValues] - Map of control names to model values.
   */
  Form.reset = modelValues => {
    mapControls(control => {
      if (control.$resetControl) {
        control.$resetControl();
      }
    });

    if (R.is(Object, modelValues)) {
      Form.setModelValues(modelValues);
    }

    Form[NG_FORM_CONTROLLER].$setPristine();
    formRegistry.forEach(childForm => childForm.reset());
  };
}


FormController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$q', '$scope', '$transclude', 'Formation'];


app.run(Formation => {
  Formation.$registerComponent(FORM_COMPONENT_NAME, {
    require: {
      $parentForm: `?^^${FORM_COMPONENT_NAME}`
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
});


export default FormController;
