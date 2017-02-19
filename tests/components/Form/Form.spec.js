// import R from 'ramda';

import qMock from '../../__mocks__/$q.mock';
import scopeMock from '../../__mocks__/$scope.mock';

import {
  // CONFIGURABLE_VALIDATOR,
  CUSTOM_ERROR_KEY,
  // FORM_COMPONENT_NAME,
  REGISTER_FORM_CALLBACK,
  REGISTER_NG_MODEL_CALLBACK
} from '../../../src/etc/constants';

import {
  CUSTOM_ERROR_MESSAGE_KEY,
  NG_FORM_CONTROLLER,
  FormController
} from '../../../src/components/Form/Form';

import {
  // FORM_CONTROLLER,
  NG_MESSAGES,
  NG_MODEL_CTRL
  // FormationControl
} from '../../../src/components/FormationControl';

import {
  mergeDeep
} from '../../../src/etc/utils';

jest.useFakeTimers();

function createForm (bindings, injectables = {}) {
  let i = Object.assign({
    $attrs: {},
    $log: {},
    $parse: {},
    $q: qMock,
    $scope: scopeMock,
    Formation: {
      $getNextId: () => 42,
      $getShowErrorsOnStr: () => ''
    }
  }, injectables);

  let form = Object.assign(new FormController(
    i.$attrs,
    i.$log,
    i.$parse,
    i.$q,
    i.$scope,
    i.Formation
  ), bindings);

  i.$scope.Form = form;

  return form;
}

function ngModelCtrl (attrs) {
  return Object.assign({
    $validate () { },
    $setValidity (errorKey, valid) {
      this.$error[errorKey] = !valid;
    },
    $parsers: [],
    $formatters: [],
    $validators: {},
    $asyncValidators: {},
    $error: {}
  }, attrs);
}

function formationCtrl (spec) {
  let base = {
    name: spec.name,
    [NG_MODEL_CTRL]: ngModelCtrl({
      $name: spec.name
    })
  };

  return mergeDeep(base, spec);
}


describe('FormController', () => {
  describe('ngForm registration', () => {
    describe('trying to register multiple forms', () => {
      it('should throw an error', () => {
        let form = createForm({
          [NG_FORM_CONTROLLER]: {}
        });

        let test = () => {
          form[REGISTER_FORM_CALLBACK]();
        };

        expect(test).toThrow(/ngForm already registered/);
      });
    });

    describe('registering a form controller', () => {
      let ngForm = {};
      let ngFormProps = ['$dirty', '$invalid', '$pending', '$pristine', '$submitted', '$valid'];

      ngFormProps.forEach(prop => {
        ngForm[prop] = prop;
      });

      let form = createForm();
      form[REGISTER_FORM_CALLBACK](ngForm);

      it('should assign ngForm to the correct key', () => {
        expect(form[NG_FORM_CONTROLLER]).toBe(ngForm);
      });

      it('should expose the correct properties from ngForm', () => {
        ngFormProps.forEach(prop => {
          expect(form[prop]).toBe(prop);
        });
      });
    });
  });

  describe('ngModel registration', () => {
    it('should define an ngModel registration method', () => {
      let form = createForm();
      expect(typeof form[REGISTER_NG_MODEL_CALLBACK]).toBe('function');
    });

    it('should create a mock control', () => {
      let spy = jest.fn();
      let controlName = 'foo';
      let ctrl = ngModelCtrl({$name: controlName});
      let form = createForm({}, {
        $scope: {
          $watch: spy,
          $on: () => {}
        }
      });

      form[REGISTER_NG_MODEL_CALLBACK](ctrl);

      expect(form.getControl(controlName)).toMatchObject({
        name: controlName,
        $ngModelCtrl: ctrl
      });
    });
  });

  describe('$onInit', () => {
    describe('setting the "$debugging" flag', () => {
      describe('when the "debug" attribute is present', () => {
        it('should set the "$debugging" flag to "true"', () => {
          let form = createForm({}, {
            $attrs: {
              debug: true
            }
          });

          form.$onInit();
          expect(form.$debugging).toBe(true);
        });
      });

      describe('when the "debug" attribute is absent', () => {
        it('should not set the "$debugging" flag to "true"', () => {
          let form = createForm();
          expect(form.$debugging).toBeFalsy();
        });
      });
    });

    describe('assigning "$name" to parent scope', () => {
      describe('when provided a non-empty string', () => {
        let formName = 'vm.myForm';

        let assignSpy = jest.fn();

        let parseSpy = jest.fn().mockImplementation(() => {
          return {
            assign: assignSpy
          };
        });

        let form = createForm({
          $name: formName
        }, {
          $parse: parseSpy
        });

        form.$onInit();

        it('should assign the form controller to its parent scope', () => {
          expect(parseSpy.mock.calls[0]).toEqual(expect.arrayContaining([formName]));
          expect(assignSpy.mock.calls[0]).toEqual(expect.arrayContaining([form]));
        });
      });

      describe('when not provided a falsy value', () => {
        let form = createForm({});
        form.$onInit();

        it('should assign an auto-generated name', () => {
          expect(form.$name).toMatch(new RegExp(`Form-\\d*`));
        });
      });
    });

    describe('parsing "$showErrorsOn"', () => {
      describe('when provided a valid string', () => {
        let form = createForm({
          $showErrorsOn: 'touched, submitted'
        });

        form.$onInit();

        it('should parse the string into an array of flags', () => {
          expect(form.showErrorsOn).toEqual(['$touched', '$submitted']);
        });
      });

      describe('when provided a falsy value', () => {
        let form = createForm();

        form.$onInit();

        it('should no-op', () => {
          expect(form.showErrorsOn).toBeFalsy();
        });
      });

      describe('when provided an empty string', () => {
        let form = createForm({
          $showErrorsOn: ''
        });

        form.$onInit();

        it('should no-op', () => {
          expect(form.showErrorsOn).toBeFalsy();
        });
      });
    });
  });

  describe('$isDisabled', () => {
    it('should return true when "$disabled" is truthy', () => {
      let form = createForm({$disabled: true});
      expect(form.$isDisabled()).toBe(true);
    });

    it('should return true when "$ngDisabled" is truthy', () => {
      let form = createForm({$ngDisabled: true});
      expect(form.$isDisabled()).toBe(true);
    });

    it('should return a falsy value when neither "$disabled" or "$ngDisabled" are true', () => {
      let form = createForm();
      expect(form.$isDisabled()).toBeFalsy();
    });
  });

  describe('$getModelValue / $setModelValue', () => {
    it('should get/set the model value for the named control', () => {
      let ctrlName = 'foo';
      let value = 'bar';
      let form = createForm();
      form.$setModelValue(ctrlName, value);
      expect(form.$getModelValue(ctrlName)).toBe(value);
    });
  });

  describe('$registerControl', () => {
    let ctrlName = 'foo';

    describe('assigning a uid', () => {
      it('should assign a uid to the control', () => {
        let form = createForm({});

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl.$uid).toMatch(new RegExp(`${ctrlName}-\\d*`));
      });
    });

    describe('adding controls to the registry', () => {
      it('should add the control to the registry', () => {
        let form = createForm({});

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(form.getControl(ctrlName)).toBe(ctrl);
      });
    });

    describe('applying parsers', () => {
      it('should apply parsers to the control', () => {
        let parsers = [
          () => {}
        ];

        let form = createForm({
          $controlConfiguration: {
            [ctrlName]: {
              parsers
            }
          }
        });

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl[NG_MODEL_CTRL].$parsers).toEqual(expect.arrayContaining(parsers));
      });
    });

    describe('applying formatters', () => {
      it('should apply formatters to the control', () => {
        let formatters = [
          () => {}
        ];

        let form = createForm({
          $controlConfiguration: {
            [ctrlName]: {
              formatters
            }
          }
        });

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl[NG_MODEL_CTRL].$formatters).toEqual(expect.arrayContaining(formatters));
      });
    });

    describe('applying validators', () => {
      it('should apply validators to the control', () => {
        let validators = {
          foo: () => {}
        };

        let form = createForm({
          $controlConfiguration: {
            [ctrlName]: {
              validators
            }
          }
        });

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl[NG_MODEL_CTRL].$validators).toEqual(expect.objectContaining(validators));
      });
    });

    describe('applying async validators', () => {
      it('should apply async validators to the control', () => {
        let asyncValidators = {
          foo: () => {}
        };

        let form = createForm({
          $controlConfiguration: {
            [ctrlName]: {
              asyncValidators
            }
          }
        });

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl[NG_MODEL_CTRL].$asyncValidators).toEqual(expect.objectContaining(asyncValidators));
      });
    });

    describe('applying error messages', () => {
      it('should apply ngMessages to the control', () => {
        let errors = [
          ['foo', 'bar']
        ];

        let form = createForm({
          $controlConfiguration: {
            [ctrlName]: {
              errors
            }
          }
        });

        let ctrl = formationCtrl({
          name: ctrlName
        });

        form.$onInit();

        form.$registerControl(ctrl);

        expect(ctrl[NG_MESSAGES]).toEqual(expect.arrayContaining(errors));
      });
    });
  });

  describe('$unregisterControl', () => {
    let ctrlName = 'foo';
    let form = createForm();
    let ctrl = {
      name: ctrlName,
      [NG_MODEL_CTRL]: ngModelCtrl({
        $name: ctrlName
      })
    };

    form.$registerControl(ctrl);

    it('should unregister the named control', () => {
      expect(form.getControl(ctrlName)).toBe(ctrl);
      form.$unregisterControl(ctrl);
      expect(form.getControl(ctrlName)).toBeFalsy();
    });
  });

  describe('$debug', () => {
    it('should log debug messages when "$debugging" is true', () => {
      let spy = jest.fn();
      let message = 'foo';
      let form = createForm({}, {
        $attrs: {
          debug: true
        },
        $log: {
          log: spy
        }
      });

      form.$onInit();
      form.$debug(message);
      expect(spy.mock.calls[0]).toEqual(expect.arrayContaining([message]));
    });
  });

  describe('$getErrorsForControl', () => {
    /**
     * Scenario 1
     *
     * - [ ] Control is invalid
     * - [X] Show errors on $touched
     * - [X] Show errors on $submitted
     * - [ ] Control has been touched
     * - [ ] Form has been submitted
     */
    it('Scenario 1', () => {
      let ctrlName = 'foo';

      let form = createForm({
        $showErrorsOn: 'touched, submitted',
        [NG_FORM_CONTROLLER]: {
          $submitted: false
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: true,
          $touched: false
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toBe(false);
    });


    /**
     * Scenario 2
     *
     * - [X] Control is invalid
     * - [X] Show errors on $touched
     * - [X] Show errors on $submitted
     * - [ ] Control has been touched
     * - [ ] Form has been submitted
     */
    it('Scenario 2', () => {
      let ctrlName = 'foo';

      let form = createForm({
        $showErrorsOn: 'touched, submitted',
        [NG_FORM_CONTROLLER]: {
          $submitted: false
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: false,
          $touched: false
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toBe(false);
    });


    /**
     * Scenario 3
     *
     * - [X] Control is invalid
     * - [X] Show errors on $touched
     * - [ ] Show errors on $submitted
     * - [ ] Control has been touched
     * - [ ] Form has been submitted
     */
    it('Scenario 3', () => {
      let ctrlName = 'foo';

      let form = createForm({
        $showErrorsOn: 'touched',
        [NG_FORM_CONTROLLER]: {
          $submitted: false
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: false,
          $touched: false
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toBe(false);
    });


    /**
     * Scenario 4
     *
     * - [X] Control is invalid
     * - [ ] Show errors on $touched
     * - [ ] Show errors on $submitted
     * - [ ] Control has been touched
     * - [ ] Form has been submitted
     */
    it('Scenario 4', () => {
      let ctrlName = 'foo';
      let errors = {
        foo: 'bar'
      };

      let form = createForm({
        [NG_FORM_CONTROLLER]: {
          $submitted: false
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: false,
          $touched: false,
          $error: errors
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toEqual(expect.objectContaining(errors));
    });


    /**
     * Scenario 5
     *
     * - [X] Control is invalid
     * - [ ] Show errors on $touched
     * - [X] Show errors on $submitted
     * - [X] Control has been touched
     * - [ ] Form has been submitted
     */
    it('Scenario 5', () => {
      let ctrlName = 'foo';

      let form = createForm({
        $showErrorsOn: 'submitted',
        [NG_FORM_CONTROLLER]: {
          $submitted: false
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: false,
          $touched: true
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toBe(false);
    });


    /**
     * Scenario 6
     *
     * - [X] Control is invalid
     * - [ ] Show errors on $touched
     * - [X] Show errors on $submitted
     * - [ ] Control has been touched
     * - [X] Form has been submitted
     */
    it('Scenario 6', () => {
      let ctrlName = 'foo';

      let errors = {
        foo: 'bar'
      };

      let form = createForm({
        $showErrorsOn: 'submitted',
        [NG_FORM_CONTROLLER]: {
          $submitted: true
        }
      });

      let ctrl = formationCtrl({
        name: ctrlName,
        [NG_MODEL_CTRL]: {
          $valid: false,
          $touched: true,
          $error: errors
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      expect(form.$getErrorsForControl(ctrlName)).toEqual(expect.objectContaining(errors));
    });
  });

  describe('$getCustomErrorMessageForControl', () => {
    let ctrlName = 'foo';
    let message = 'bar';

    let form = createForm();

    let ctrl = formationCtrl({
      name: ctrlName,
      [NG_MODEL_CTRL]: {
        $name: ctrlName
      },
      [CUSTOM_ERROR_MESSAGE_KEY]: message
    });

    form.$onInit();
    form.$registerControl(ctrl);

    it('should retrun the custom error message for the named control', () => {
      expect(form.$getCustomErrorMessageForControl(ctrlName)).toBe(message);
    });
  });

  describe('$submit', () => {
    function onSubmitForm () {
      let onSubmitReturn;

      let onSubmitSpy = jest.fn(() => {
        return onSubmitReturn;
      });

      let form = createForm({
        $onSubmit: onSubmitSpy,
        $submitting: false,
        [NG_FORM_CONTROLLER]: {
          $valid: true,
          $pending: false
        }
      });

      // Spy on the disable() method.
      let origDisable = form.disable;
      let disableSpy = jest.fn(() => {
        origDisable();
      });
      form.disable = disableSpy;

      // Spy on the enable() method.
      let origEnable = form.enable;
      let enableSpy = jest.fn(() => {
        origEnable();
      });
      form.enable = enableSpy;

      form.$onInit();

      return {
        form,
        spies: {
          onSubmit: onSubmitSpy,
          enable: enableSpy,
          disable: disableSpy
        },
        valid (value) {
          form[NG_FORM_CONTROLLER].$valid = value;
        },
        pending (value) {
          form[NG_FORM_CONTROLLER].$pending = value;
        },
        submitting (value) {
          form.$submitting = value;
        },
        onSubmitReturn (value) {
          onSubmitReturn = value;
        }
      };
    }


    /**
     * Scenario 1
     *
     * - [X] Form is already submitting
     * - [ ] Form has pending async validators
     * - [ ] Form is valid
     * - [ ] Control has a custom error set
     * - [ ] onSubmit returned field errors
     */
    describe('Scenario 1', () => {
      it('should return immediately', () => {
        expect.assertions(1);

        let test = onSubmitForm();
        test.submitting(true);

        return test.form.$submit().catch(err => {
          expect(err.message).toBe('SUBMIT_IN_PROGRESS');
        });
      });
    });


    /**
     * Scenario 2
     *
     * - [ ] Form is already submitting
     * - [X] Form has pending async validators
     * - [ ] Form is valid
     * - [ ] Control has a custom error set
     * - [ ] onSubmit returned field errors
     */
    describe('Scenario 2', () => {
      it('should wait until $pending is "false"', () => {
        expect.assertions(4);

        let test = onSubmitForm();
        test.pending(true);
        test.valid(false);
        setImmediate(() => test.pending(false));

        let promise = test.form.$submit().catch(err => {
          expect(err.message).toBe('NG_FORM_INVALID');
          expect(test.spies.disable.mock.calls.length).toBe(1);
          expect(test.spies.onSubmit.mock.calls.length).toBe(0);
          expect(test.spies.enable.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        return promise;
      });
    });


    /**
     * Scenario 3
     *
     * - [ ] Form is already submitting
     * - [X] Form has pending async validators
     * - [X] Form is valid
     * - [ ] Control has a custom error set
     * - [ ] onSubmit returned field errors
     */
    describe('Scenario 3', () => {
      it('should wait until $pending is false, then call onSubmit', () => {
        expect.assertions(4);

        let test = onSubmitForm();
        test.pending(true);
        test.valid(true);
        setImmediate(() => test.pending(false));

        let promise = test.form.$submit().then(result => {
          expect(result).toBe('SUBMIT_COMPLETE');
          expect(test.spies.disable.mock.calls.length).toBe(1);
          expect(test.spies.onSubmit.mock.calls.length).toBe(1);
          expect(test.spies.enable.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        return promise;
      });
    });


    /**
     * Scenario 4
     *
     * - [ ] Form is already submitting
     * - [ ] Form has pending async validators
     * - [X] Form is valid
     * - [ ] Control has a custom error set
     * - [X] onSubmit returned a promise
     */
    describe('Scenario 4', () => {
      it('should call onSubmit and apply field errors', () => {
        expect.assertions(5);

        let ctrlName = 'foo';
        let fieldError = 'bar';

        let ctrl = formationCtrl({
          name: ctrlName
        });

        let fieldErrors = {
          [ctrlName]: fieldError
        };

        let test = onSubmitForm();
        test.pending(false);
        test.valid(true);
        test.onSubmitReturn(fieldErrors);
        test.form.$registerControl(ctrl);

        let promise = test.form.$submit().then(result => {
          expect(result).toBe('SUBMIT_COMPLETE');
          expect(test.spies.disable.mock.calls.length).toBe(1);
          expect(test.spies.onSubmit.mock.calls.length).toBe(1);
          expect(test.spies.enable.mock.calls.length).toBe(1);
          expect(ctrl[CUSTOM_ERROR_MESSAGE_KEY]).toBe(fieldError);
        });

        jest.runAllTimers();
        return promise;
      });
    });


    /**
     * Scenario 5
     *
     * - [ ] Form is already submitting
     * - [ ] Form has pending async validators
     * - [X] Form is valid
     * - [ ] Control has a custom error set
     * - [ ] onSubmit returned field errors
     */
    describe('Scenario 5', () => {
      it('should indicate that onSubmit did not catch', () => {
        expect.assertions(4);

        let test = onSubmitForm();
        test.pending(false);
        test.valid(true);
        test.onSubmitReturn(Promise.reject({}));

        let promise = test.form.$submit().catch(err => {
          expect(err.message).toBe('CONSUMER_REJECTED');
          expect(test.spies.disable.mock.calls.length).toBe(1);
          expect(test.spies.onSubmit.mock.calls.length).toBe(1);
          expect(test.spies.enable.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        return promise;
      });
    });


    /**
     * Scenario 6
     *
     * - [ ] Form is already submitting
     * - [ ] Form has pending async validators
     * - [ ] Form is valid
     * - [X] Control has a custom error set
     * - [ ] onSubmit returned field errors
     */
    describe('Scenario 6', () => {
      it('should clear custom errors on controls', () => {
        expect.assertions(6);

        let ctrlName = 'foo';
        let customMessage = 'bar';
        let test = onSubmitForm();

        let ctrl = formationCtrl({
          name: ctrlName,
          [CUSTOM_ERROR_MESSAGE_KEY]: customMessage,
          [NG_MODEL_CTRL]: {
            $error: {
              [CUSTOM_ERROR_KEY]: true
            }
          }
        });

        test.pending(false);
        test.valid(true);
        test.form.$registerControl(ctrl);

        let promise = test.form.$submit().then(response => {
          expect(response).toBe('SUBMIT_COMPLETE');
          expect(ctrl[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
          expect(ctrl[NG_MODEL_CTRL].$error[CUSTOM_ERROR_KEY]).toBe(false);
          expect(test.spies.disable.mock.calls.length).toBe(1);
          expect(test.spies.onSubmit.mock.calls.length).toBe(1);
          expect(test.spies.enable.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        return promise;
      });
    });
  });

  describe('getControl', () => {
    it('should return the named control, if it exists', () => {
      let ctrlName = 'foo';
      let badName = 'bar';
      let form = createForm();

      let ctrl = formationCtrl({
        name: ctrlName
      });

      form.$onInit();
      form.$registerControl(ctrl);

      expect(form.getControl(badName)).toBeFalsy();
      expect(form.getControl(ctrlName)).toBe(ctrl);
    });
  });

  describe('getModelValues / setModelValues', () => {
    it('should set and get model values', () => {
      let modelValues = {
        foo: 'bar'
      };

      let form = createForm();
      form.$onInit();

      form.setModelValues(modelValues);
      expect(form.getModelValues()).toEqual(modelValues);
    });
  });

  describe('disable', () => {
    it('should set the $disabled flag to "true"', () => {
      let form = createForm({
        $disabled: false
      });

      expect(form.$disabled).toBe(false);
      form.disable();
      expect(form.$disabled).toBe(true);
    });
  });

  describe('enable', () => {
    it('should set the $disabled flag to "false"', () => {
      let form = createForm({
        $disabled: true
      });

      expect(form.$disabled).toBe(true);
      form.enable();
      expect(form.$disabled).toBe(false);
    });
  });

  describe('reset', () => {
    it('should validate all controls and set them to pristine and untouched', () => {
      let formPristineSpy = jest.fn();
      let pristineSpy = jest.fn();
      let untouchedSpy = jest.fn();
      let validateSpy = jest.fn();

      let ctrl = formationCtrl({
        name: 'foo',
        [NG_MODEL_CTRL]: {
          $setPristine: pristineSpy,
          $setUntouched: untouchedSpy,
          $validate: validateSpy
        }
      });

      let form = createForm({
        [NG_FORM_CONTROLLER]: {
          $setPristine: formPristineSpy
        }
      });

      form.$onInit();
      form.$registerControl(ctrl);
      form.reset();

      expect(formPristineSpy.mock.calls.length).toBe(1);
      expect(pristineSpy.mock.calls.length).toBe(1);
      expect(untouchedSpy.mock.calls.length).toBe(1);
      expect(validateSpy.mock.calls.length).toBeGreaterThan(1);
    });

    it('should apply model values, if provided', () => {
      let modelValues = {
        foo: 'bar'
      };

      let form = createForm({
        [NG_FORM_CONTROLLER]: {
          $setPristine: () => {}
        }
      });
      form.$onInit();
      form.reset(modelValues);

      expect(form.getModelValues()).toEqual(modelValues);
    });
  });
});
