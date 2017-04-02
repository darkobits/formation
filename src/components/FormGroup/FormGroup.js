// -----------------------------------------------------------------------------
// ----- Form Group Component --------------------------------------------------
// -----------------------------------------------------------------------------

import R from 'ramda';
import app from '../../app';

import {
  // mergeDeep,
  throwError
} from '../../etc/utils';

import {
  // CONFIGURABLE_VALIDATOR,
  // CUSTOM_ERROR_KEY,
  FORM_COMPONENT_NAME,
  FORM_GROUP_COMPONENT_NAME,
  REGISTER_FORM_CALLBACK,
  // REGISTER_NG_MODEL_CALLBACK
} from '../../etc/constants';

// import {
//   COMPONENT_CONFIGURATION,
//   NG_MODEL_CTRL,
//   NG_MESSAGES
// } from '../FormationControl';


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
 * Key at which the form controller will store custom error messags on controls.
 *
 * @private
 *
 * @type {string}
 */
// export const CUSTOM_ERROR_MESSAGE_KEY = '$customError';


/**
 * @module FormGroupController
 *
 * @description
 *
 * This component is used to encapsulate groups of sub-forms when representing
 * arrays in nested models.
 */
export function FormGroupController ($attrs, $compile, $element, $log, $parse, $q, $scope, $transclude, Formation) {
  const FormGroup = this;

  /**
   * Counter for getNextId(). This is used to assign unique IDs to controls
   * within the form.
   *
   * @private
   *
   * @type {number}
   */
  // var counter = -1;


  /**
   * Tracks registered sub-forms.
   *
   * @private
   *
   * @type {Array}
   */
  var formRegistry = [];


  // ----- Private Methods -----------------------------------------------------


  /**
   * POSSIBLY COMMON WITH FORM, ASSIGNABLE
   *
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

    setter($scope.$parent, FormGroup);
  }


  /**
   * POSSIBLY COMMON WITH FORM, SUBMITTABLE
   *
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
   * Applies each registered form to the provided function.
   *
   * @private
   *
   * @param  {function} fn
   * @return {object}
   */
  function mapForms (fn) {
    return R.map(control => fn(control), formRegistry);
  }


  // ----- Semi-Private Methods ------------------------------------------------

  /**
   * DEFINITE OVERLAP WITH FORM, BOTH CREATE NG-FORM ELEMENTS.
   *
   * Implement a callback for ngForm.
   *
   * @private
   *
   * @param {string} name - Name of the controller being registered.
   * @param {object} controller - Controller to register.
   */
  FormGroup[REGISTER_FORM_CALLBACK] = ngFormController => {
    if (FormGroup[NG_FORM_CONTROLLER]) {
      throwError('ngForm already registered with Formation.');
    }

    FormGroup[NG_FORM_CONTROLLER] = ngFormController;

    // Expose common Angular form controller properties.
    R.forEach(prop => {
      Reflect.defineProperty(FormGroup, prop, {
        get: () => R.path([NG_FORM_CONTROLLER, prop], FormGroup)
      });
    }, ['$dirty', '$invalid', '$pending', '$pristine', '$submitted', '$valid']);
  };


  /**
   * DEFINITE OVERLAP WITH FORM, BOTH CREATE NG-FORM ELEMENTS.
   *
   * Determines whether to use a form or ngForm element based on whether this
   * instance has a parent form or not. Ensures content is transcluded correctly
   * as if "ng-transclude" had been used on the form/ngForm element.
   *
   * @private
   */
  FormGroup.$postLink = () => {
    let elementName;
    let template;

    if (FormGroup.$parentForm) {
      // If we have a parent form, use <ng-form>.
      elementName = 'ng-form';
      template = `<${elementName}></${elementName}>`;
    } else {
      // Otherwise, use <form>.
      elementName = 'form';
      template = `
      <${elementName}
        ng-submit="Form.$submit()"
        ng-model-options="{getterSetter: true}"
        novalidate>
      </${elementName}>`;
    }


    // MAY HAVE ISSUES WITH CONTROLLER BINDINGS LATER ON IF WE NEED TO DISTINGUISH
    // BETWEEN A PARENT FORM vs. PARENT FORMGROUP. MAY NEED TO USE THE SAME BINDING


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
  };


  /**
   * DEFINITE OVERLAP WITH FORM, DEBUGGABLE, ASSIGNABLE (IF TOP LEVEL).
   * MAY NOT NEED SHOW ERRORS ON.
   *
   * Set up form name and assign controller instance to its name attribute.
   *
   * @private
   */
  FormGroup.$onInit = () => {
    // Set debug mode if the "debug" attribute is present.
    if (Reflect.has($attrs, 'debug')) {
      FormGroup.$debugging = true;
    }

    if (FormGroup.$name) {
      assignToExpression(FormGroup.$name);
    } else {
      FormGroup.$name = `FormGroup-${Formation.$getNextId()}`;
    }

    // Parse error behavior.
    // FormGroup.showErrorsOn = parseFlags(Formation.$getShowErrorsOnStr() || FormGroup.$showErrorsOn);
  };


  /**
   * DEFINITE OVERLAP WITH FORM, ASSIGNABLE.
   *
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
    if (changes.$name && !changes.$name.isFirstChange()) {
      const {currentValue, previousValue} = changes.$name;
      FormGroup.$debug(`Name changed from "${previousValue}" to "${currentValue}".`);
      assignToExpression(currentValue);
    }
  };


  /**
   * DEFINITE OVERLAP WITH FORM, DISABLEABLE
   *
   * Returns true if the form should be disabled.
   *
   * @private
   *
   * @return {boolean}
   */
  FormGroup.$isDisabled = () => {
    return FormGroup.$disabled || FormGroup.$ngDisabled;
  };


  /**
   * NEEDS MODIFICATION FROM FORM, MAP OVER ALL CHILD FORMS AND RETURN AN AGGREGATE
   * MODEL VALUE
   *
   * Returns the model value for the named control.
   *
   * @private
   *
   * @param  {string} controlName
   * @return {*}
   */
  // FormGroup.$getModelValue = controlName => {
  //   return modelValues[controlName];
  // };


  /**
   * NEEDS MODIFICATION FROM FORM, MAP OVER ALL CHILD FORMS AND CALL setModelValues().
   *
   * Sets the model value for the named control to the provided value.
   *
   * @private
   *
   * @param  {string} controlName
   * @param  {*} newValue
   */
  // FormGroup.$setModelValue = (controlName, newValue) => {
  //   modelValues[controlName] = newValue;
  // };


  /**
   * DIVERGE FROM FORM, WE DONT HAVE CONTROLS, ONLY FORMS.
   *
   * Adds the provided form to the registry and applies configuration.
   *
   * @private
   *
   * @param  {object} control
   */
  FormGroup.$registerForm = form => {
    // THIS NEEDS WORK. NEED TO DETERMINE THE INDEX OF THE NEWLY ADDED FORM AND
    // GET THE INDEX OF THE CONFIG OBJECT FROM OUR LOCAL CONFIG.

    const name = form.name;
    const formConfiguration = R.pathOr({}, ['$controlConfiguration', name], FormGroup);

    FormGroup.$debug(`Registering child form "${name}".`);
    // form.$uid = `${name}-${getNextId()}`;
    formRegistry = R.append(form, formRegistry);

    // Apply configuration.
    applyConfigurationToForms(formConfiguration, form);
  };


  /**
   * Removes the provided control from the registry.
   *
   * @private
   *
   * @param  {object} control
   */
  FormGroup.$unregisterForm = form => {
    FormGroup.$debug(`Unregistering child form "${form.name}".`);
    formRegistry = R.reject(R.propEq('$uid', form.$uid), formRegistry);
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
      $log.log(`[${FormGroup.$name}]`, ...args);
    }
  };


  /**
   * OVERLAP WITH FORM, SUBMITTABLE.
   *
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
  FormGroup.$submit = () => {
    const endSubmit = () => {
      FormGroup.enable();
      FormGroup.$submitting = false;
    };

    if (FormGroup.$submitting) {
      FormGroup.$debug('Submit already in progress.');
      return $q.reject(new Error('SUBMIT_IN_PROGRESS'));
    }

    FormGroup.$submitting = true;
    FormGroup.disable();

    return waitForAsyncValidators()
    .then(() => {
      // We need to clear all custom errors set from the last submission in
      // order for the form's $valid flag to be true so we can proceed.
      mapControls(clearCustomErrorOnControl);

      if (FormGroup[NG_FORM_CONTROLLER].$valid) {
        // Invoke the consumer's onSubmit callback with current model data.
        if (typeof FormGroup.$onSubmit === 'function') {
          return $q.when(FormGroup.$onSubmit(FormGroup.getModelValues()));
        }
      } else {
        return $q.reject(new Error('NG_FORM_INVALID'));
      }
    })
    .catch(err => {
      if (err.message === 'NG_FORM_INVALID') {
        FormGroup.$debug('Form is invalid.', FormGroup[NG_FORM_CONTROLLER].$error);
        endSubmit();
        return $q.reject(err);
      }

      FormGroup.$debug('Submit failed. Consumer did not catch.', err);
      endSubmit();
      return $q.reject(new Error('CONSUMER_REJECTED'));
    })
    .then(fieldErrors => {
      // TODO: APPLY FIELD ERRORS TO CHILD FORMS HERE.

      endSubmit();
      return $q.resolve('SUBMIT_COMPLETE');
    })
    .catch(err => {
      // We want to catch the rejections returned above so as to not produce
      // console errors in production environments, but we want to re-throw them
      // when testing so we know exactly what happened during a submission.
      if (typeof process !== 'undefined' && process.env.NODE_ENV === 'test') {
        return $q.reject(err);
      }
    });
  };


  // ----- Public Methods ------------------------------------------------------

  /**
   * @alias module:FormGroupController.getForm
   *
   * @description
   *
   * Returns the first form whose name matches the provided value.
   *
   * @param  {string} formName
   * @return {object} - Form instance.
   */
  FormGroup.getForm = formName => {
    return R.find(R.propEq('name', formName), formRegistry);
  };


  /**
   * @function getModelValues
   * @memberOf FormGroupController
   * @instance
   *
   * @description
   *
   * Returns a new object containing the current non-`null` and non-`undefined`
   * model values for all controls in each registered child form. This is the
   * same method used to generate model values that are passed to submit
   * handlers.
   *
   * @return {array} - Collection of child form model values.
   */
  FormGroup.getModelValues = () => {
    // THIS MAY NEED FIXING...
    return R.reject(modelValue => {
      return R.isNil(modelValue) || modelValue === '';
    }, mapForms(form => form.getModelValues()));
  };


  /**
   * THIS NEEDS MORE THOUGHT, SHOULD WE JUST SET THINGS IN-ORDER??
   *
   * @description
   *
   * Sets the model values of each child form.
   *
   * @param  {array} modelValues - Collection of child form model value objects
   *   to set.
   */
  FormGroup.setModelValues = formModelValues => {
    R.forEach((modelValues, form) => {
      form.setModelValues(modelValues);
    }, R.zip(formModelValues, formRegistry));
  };


  /**
   * OVERLAP WITH FORM, DISABLEABLE
   *
   * Disables the form and any controls that use `$isDisabled`.
   */
  FormGroup.disable = () => {
    FormGroup.$disabled = true;
  };


  /**
   * OVERLAP WITH FORM, DISABLEABLE
   *
   * Enables the form and any controls that use `$isDisabled`.
   *
   * Note: The form may still remain disabled via `ngDisabled`.
   */
  FormGroup.enable = () => {
    FormGroup.$disabled = false;
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
   * @param  {array} [modelValues] - Collection of form model value objects to
   *   set.
   */
  FormGroup.reset = formModelValues => {
    // Be careful with "zip" here, we don't want to truncate to the shorter of
    // the two collections if the user didnt provide a complete set of model
    // data.


    mapForms(form => {
      console.log('RESET FORM', form.name, 'YO');
    });


  //   mapControls(resetControl);

  //   if (R.is(Object, modelValues)) {
  //     Form.setModelValues(modelValues);
  //   }

  //   Form[NG_FORM_CONTROLLER].$setPristine();
  //   mapControls(control => control[NG_MODEL_CTRL].$validate());
  };
}


FormController.$inject = ['$attrs', '$compile', '$element', '$log', '$parse', '$q', '$scope', '$transclude', 'Formation'];


app.run(Formation => {
  Formation.$registerComponent(FORM_GROUP_COMPONENT_NAME, {
    require: {
      $parentForm: `?^^${FORM_COMPONENT_NAME}`,
      $parentFormGroup: `?^^${FORM_GROUP_COMPONENT_NAME}`
    },
    bindings: {
      $name: '@name',
      $controlConfiguration: '<controls',
      $onSubmit: '<onSubmit',
      $showErrorsOn: '@showErrorsOn',
      $ngDisabled: '<ngDisabled'
    },
    transclude: true,
    controller: FormGroupController,
    controllerAs: 'FormGroup'
  });
});


export default FormGroupController;
