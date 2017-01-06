// -----------------------------------------------------------------------------
// ----- Form Component --------------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';

import formationModule from 'formation/module';

import {
  mergeDeep,
  throwError
} from 'formation/etc/utils';

import {
  RWP_CALLBACK
} from 'formation/components/RegisterWithParent';

import {
  CONFIGURABLE_VALIDATOR,
  CUSTOM_ERROR_KEY,
  FORM_COMPONENT_NAME
} from 'formation/etc/constants';

import {
  COMPONENT_CONFIGURATION,
  NG_MODEL_CTRL,
  NG_MESSAGES
} from 'formation/components/FormationControl';


/**
 * Key at which the Formation form controller will store a reference to the
 * Angular form controller
 *
 * @private
 *
 * @type {string}
 */
const NG_FORM_CONTROLLER = '$ngFormController';


/**
 * Key at which the form controller will store custom error messags on controls.
 *
 * @private
 *
 * @type {string}
 */
const CUSTOM_ERROR_MESSAGE_KEY = '$customError';


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
function FormController ($attrs, $log, $parse, $q, $scope, Formation) {
  const Form = this;

  /**
   * Counter for getNextId(). This is used to assign unique IDs to controls
   * within the form.
   *
   * @private
   *
   * @type {number}
   */
  var counter = -1;


  /**
   * Tracks registered controls.
   *
   * @private
   *
   * @type {Array}
   */
  var controlRegistry = [];


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
   * Applies form-level configuration to a control (or mock control).
   *
   * @private
   *
   * @param  {object} configuration - Configuration to apply.
   * @param  {object} control - Control instance.
   */
  function applyConfigurationToControl (configuration, control) {
    const ngModelCtrl = control[NG_MODEL_CTRL];

    if (!ngModelCtrl) {
      return;
    }

    // Merge provided configuration and control's configuration.
    const mergedConfig = mergeDeep(R.pathOr({}, [COMPONENT_CONFIGURATION], control), configuration);

    const {
      errors,
      parsers,
      formatters,
      validators,
      asyncValidators,
      ngModelOptions
    } = mergedConfig;

    Form.$debug(`Applying configuration to "${control.name}":`, mergedConfig);

    // Set up error messages.
    if (Array.isArray(errors)) {
      control[NG_MESSAGES] = control[NG_MESSAGES] || [];

      errors.forEach(error => {
        if (!Array.isArray(error) || error.length !== 2) {
          throwError(`Expected error message tuple to be an array of length 2, got "${typeof error}".`);
        } else if (!R.contains(error, control[NG_MESSAGES])) {
          control[NG_MESSAGES].push(error);
        }
      });
    }


    // Set up parsers.
    if (Array.isArray(parsers)) {
      parsers.forEach(parser => {
        if (!R.is(Function, parser)) {
          throwError(`Expected parser to be a function, got "${typeof parser}".`);
        } else if (!R.contains(parser, ngModelCtrl.$parsers)) {
          ngModelCtrl.$parsers.push(parser);
        }
      });
    }


    // Set up formatters.
    if (Array.isArray(formatters)) {
      formatters.forEach(formatter => {
        if (!R.is(Function, formatter)) {
          throwError(`Expected formatter to be a function, got "${typeof formatter}".`);
        } else if (!R.contains(formatter, ngModelCtrl.$formatters)) {
          ngModelCtrl.$formatters.push(formatter);
        }
      });
    }


    // Set up syncronous validators.
    if (R.is(Object, validators)) {
      R.mapObjIndexed((validator, name) => {
        if (!R.is(Function, validator)) {
          throwError(`Expected validator to be a function, got "${typeof validator}".`);
        } else if (!R.has(name, ngModelCtrl.$validators)) {
          if (validator[CONFIGURABLE_VALIDATOR]) {
            // Currently, configurable validators are passed the form controller
            // and the control instance that the validator is being applied to.
            ngModelCtrl.$validators[name] = validator(Form, control);
          } else {
            ngModelCtrl.$validators[name] = validator;
          }
        }
      }, validators);
    }


    // Set up asyncronous validators.
    if (R.is(Object, asyncValidators)) {
      R.mapObjIndexed((asyncValidator, name) => {
        if (!R.is(Function, asyncValidator)) {
          throwError(`Expected validator to be a function, got "${typeof asyncValidator}".`);
        } else if (!R.has(name, ngModelCtrl.$asyncValidators)) {
          ngModelCtrl.$asyncValidators[name] = asyncValidator;
        }
      }, asyncValidators);
    }


    // Configure ngModelOptions.
    if (R.is(Object, ngModelOptions)) {
      ngModelCtrl.$options = ngModelCtrl.$options.createChild(ngModelOptions);
    }


    // Validate the control to ensure any new parsers/formatters/validators
    // are run.
    ngModelCtrl.$validate();
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
  function applyCustomErrorOnControl (control, errorMessage) {
    if (!R.is(String, errorMessage)) {
      throwError(`Expected error key to be of type "string" but got "${typeof errorMessage}".`);
    }

    if (control) {
      Form.$debug(`Setting custom error "${errorMessage}" on control "${control.name}".`);
      control[CUSTOM_ERROR_MESSAGE_KEY] = errorMessage;
      control.$ngModelCtrl.$setValidity(CUSTOM_ERROR_KEY, false);
    }
  }


  /**
   * Sets the "custom" validity state of the provided control to true, and
   * clears the custom error message.
   *
   * @private
   *
   * @param  {object} control
   */
  function clearCustomErrorOnControl (control) {
    if (R.path([NG_MODEL_CTRL, '$error', CUSTOM_ERROR_KEY], control)) {
      Form.$debug(`Clearing custom error on control "${control.name}".`);
      control[NG_MODEL_CTRL].$setValidity(CUSTOM_ERROR_KEY, true);
      Reflect.deleteProperty(control, CUSTOM_ERROR_MESSAGE_KEY);
    }
  }


  /**
   * Resets the provided contol to an untouched, pristine state. Does not change
   * the control's model value.
   *
   * @private
   *
   * @param  {object} control
   */
  function resetControl (control) {
    const ngModelCtrl = control[NG_MODEL_CTRL];

    if (ngModelCtrl) {
      ngModelCtrl.$setUntouched();
      ngModelCtrl.$setPristine();
    }
  }


  /**
   * Wraps an ngModel controller instance in a mock control instance, allowing
   * users to use ngModel in conjunction with RegisterWithParent to register
   * arbitrary controls with the form.
   *
   * @example
   *
   * <fm name="vm.myForm">
   *   <input type="text"
   *     name="email"
   *     ng-model="vm.email"
   *     register-with-parent="ngModel:myForm">
   * </fm>
   *
   * @private
   *
   * @param  {object} ngModelCtrl
   * @return {object}
   */
  function createMockInputControl (ngModelCtrl) {
    const controlName = ngModelCtrl.$name;

    // We don't know what this control's ngModel expression is bound do, so in
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
    const deferred = $q.defer();
    const watchExpression = `Form.${NG_FORM_CONTROLLER}.$pending`;

    const cancelWatcher = $scope.$watch(watchExpression, isPending => {
      if (!isPending) {
        cancelWatcher();
        deferred.resolve();
      }
    });

    return deferred.promise;
  }


  /**
   * Accepts a comma/space-delimited list of fields and returns an array of
   * $-prefixed fields.
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
    const states = R.map(state => {
      return state.length && `$${state.replace(/[, ]/g, '')}`;
    }, String(string).split(' '));

    return R.filter(R.identity, states);
  }


  /**
   * Applies each registered control to the provided function.
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
   * Handles field errors returned from the consumer's submit handler.
   * Expects a mapping of field names to error messages.
   *
   * @private
   *
   * @param  {object} fieldErrors
   */
  function applyFieldErrors (fieldErrors) {
    if (R.is(Object, fieldErrors)) {
      R.forEach(error => {
        const [controlName, message] = error;

        R.forEach(control => {
          applyCustomErrorOnControl(control, message);
        }, R.filter(R.propEq('name', controlName), controlRegistry));
      }, R.toPairs(fieldErrors));
    }
  }


  // ----- Semi-Private Methods ------------------------------------------------

  /**
   * Implement a RegisterWithParent callback.
   *
   * @private
   *
   * @param {string} name - Name of the controller being registered.
   * @param {object} controller - Controller to register.
   */
  Form[RWP_CALLBACK] = (name, controller) => {
    switch (name) {
      case 'form':
        Form[NG_FORM_CONTROLLER] = controller;

        // Expose common Angular form controller properties.
        R.forEach(prop => {
          Reflect.defineProperty(Form, prop, {
            get: () => R.path([NG_FORM_CONTROLLER, prop], Form)
          });
        }, ['$dirty', '$invalid', '$pending', '$pristine', '$submitted', '$valid']);
        break;
      case 'ngModel':
        Form.$registerControl(createMockInputControl(controller));
        break;
      default:
        Form.$debug(`Unknown controller type: "${name}".`);
        break;
    }
  };


  /**
   * Set up form name and assign controller instance to its name attribute.
   *
   * @private
   */
  Form.$onInit = () => {
    // Set debug mode if the "debug" attribute is present.
    if ($attrs.hasOwnProperty('debug')) {
      Form.$debugging = true;
    }

    if (Form.$name) {
      assignToExpression(Form.$name);
    } else {
      Form.$name = `Form-${Formation.$getNextId()}`;
    }

    // Parse error behavior.
    Form.showErrorsOn = parseFlags(Formation.$getShowErrorsOnStr() || Form.$showErrorsOn);
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
    if (changes.$name && !changes.$name.isFirstChange()) {
      const {currentValue, previousValue} = changes.$name;
      Form.$debug(`Name changed from "${previousValue}" to "${currentValue}".`);
      assignToExpression(currentValue);
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
    return Form.$disabled || Form.$ngDisabled;
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
    const name = control.name;
    const formConfiguration = R.pathOr({}, ['$controlConfiguration', name], Form);

    Form.$debug(`Registering control "${name}".`);
    control.$uid = `${name}-${getNextId()}`;
    controlRegistry = R.append(control, controlRegistry);

    // Apply configuration.
    applyConfigurationToControl(formConfiguration, control);
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
   * Passes provided arguments to $log.log if the "debug" attribute is
   * present on the form element.
   *
   * @private
   *
   * @param  {...arglist} args
   */
  Form.$debug = (...args) => {
    if (Form.$debugging) {
      $log.log(`[${Form.$name}]`, ...args);
    }
  };


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
  Form.$getErrorsForControl = controlName => {
    const ngModelCtrl = R.pathOr({}, [NG_MODEL_CTRL], R.find(R.propEq('name', controlName), controlRegistry));

    // If the control is valid, return.
    if (ngModelCtrl.$valid) {
      return false;
    }

    // If the user did not configure error behavior, return the control's errors
    // if it is invalid.
    if (!Form.showErrorsOn.length) {
      return ngModelCtrl.$invalid && ngModelCtrl.$error;
    }

    // Otherwise, determine if the control should show errors.
    const errorState = Form.showErrorsOn.reduce((accumulator, state) => {
      const controlHasState = ngModelCtrl[state];
      const formHasState = Form[NG_FORM_CONTROLLER][state];
      return accumulator || controlHasState || formHasState;
    }, false);

    return errorState ? ngModelCtrl.$error : false;
  };


  /**
   * Returns the copy for the current custom error message on the named control,
   * if set.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {string}
   */
  Form.$getCustomErrorMessageForControl = controlName => {
    return R.find(R.propEq('name', controlName), controlRegistry)[CUSTOM_ERROR_MESSAGE_KEY];
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
  Form.$submit = () => {
    if (Form.$submitting) {
      Form.$debug('Submit already in progress.');
      return;
    }

    Form.$submitting = true;
    Form.disable();

    waitForAsyncValidators()
    .then(() => {

      /**
       * We need to clear all custom errors set from the last submission in
       * order for the form's $valid flag to be true so we can proceed.
       */
      mapControls(clearCustomErrorOnControl);

      if (Form[NG_FORM_CONTROLLER].$valid) {
        // Invoke the consumer's onSubmit callback with current model data.
        return Form.$onSubmit(Form.getModelValues());
      } else {
        Form.$debug('Form is invalid.', Form[NG_FORM_CONTROLLER].$error);
      }
    })
    .catch(error => {
      Form.$debug('Submit failed, consumer did not catch.', error);
    })
    .then(fieldErrors => {

      /**
       * If the consumer returned an object, assume it is a mapping of field
       * names to error messages and apply each error to its field.
       */
      if (R.is(Object, fieldErrors)) {
        applyFieldErrors(fieldErrors);
      }

      Form.enable();
      Form.$submitting = false;
    });
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
    return R.reject(modelValue => {
      return R.isNil(modelValue) || modelValue === '';
    }, modelValues);
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
    R.forEach(args => {
      Form.$setModelValue(...args);
    }, R.toPairs(modelValues));
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
    mapControls(resetControl);

    if (R.is(Object, modelValues)) {
      Form.setModelValues(modelValues);
    }

    Form[NG_FORM_CONTROLLER].$setPristine();
    mapControls(control => control[NG_MODEL_CTRL].$validate());
  };
}


formationModule.run(Formation => {
  Formation.$registerComponent(FORM_COMPONENT_NAME, {
    bindings: {
      $name: '@name',
      $controlConfiguration: '<controls',
      $onSubmit: '<onSubmit',
      $showErrorsOn: '@showErrorsOn',
      $ngDisabled: '<ngDisabled'
    },
    transclude: true,
    controller: FormController,
    controllerAs: 'Form',
    template: `
      <form novalidate
        ng-submit="Form.$submit()"
        ng-model-options="{getterSetter: true}"
        register-with-parent="form:${FORM_COMPONENT_NAME}"
        ng-transclude>
      </form>
    `
  });
});
