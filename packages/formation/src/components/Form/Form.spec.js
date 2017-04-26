import {
  module,
  compile,
  directive,
  digest
} from '@darkobits/unity';

import {
  RegisterNgForm,
  RegisterForm,
  RegisterControl,
  RegisterNgModel,
  Configure,
  GetModelValue,
  SetModelValue,
  SetCustomErrorMessage,
  ClearCustomErrorMessage,
  Reset
} from '../../etc/interfaces';

import {
  CUSTOM_ERROR_KEY,
  NG_MODEL_CTRL
} from '../../etc/constants';

import Formation from '../../index';

import {
  CUSTOM_ERROR_MESSAGE_KEY
} from '../../classes/FormationControl';

import {
  NG_FORM_CONTROLLER
} from './Form';

describe('FormController', () => {
  let T;
  const logSpy = jest.fn();

  beforeEach(() => {
    module(Formation, {
      mock: {
        $log: {
          log: logSpy
        }
      }
    });

    T = directive('fm', {
      template: '<fm></fm>'
    });
  });


  // ----- Interfaces ----------------------------------------------------------

  describe('[Interface] RegisterNgForm', () => {
    it('should implement the RegisterNgForm interface', () => {
      expect(typeof T.fm[RegisterNgForm]).toEqual('function');
    });

    it('should assign the ngForm controller to the correct key', () => {
      expect(T.fm[NG_FORM_CONTROLLER]).toBeTruthy();
    });

    it('should expose validation properties from ngForm', () => {
      const props = ['$dirty', '$invalid', '$pending', '$pristine', '$submitted', '$valid'];

      props.forEach(prop => {
        expect(Reflect.has(T.fm, prop)).toBe(true);
      });
    });

    describe('trying to register multiple ngForms', () => {
      it('should throw an error', () => {
        const ngForm = compile({
          template: '<form></form>',
          scope: T.$scope.$new()
        });

        expect(() => {
          T.fm[RegisterNgForm](ngForm);
        }).toThrow(/ngForm already registered/);
      });
    });
  });

  describe('[Interface] RegisterForm', () => {
    it('should implement the RegisterForm interface', () => {
      expect(typeof T.fm[RegisterForm]).toEqual('function');
    });

    describe('when another child form with the same name is present', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm name="parentForm">
              <fm name="childForm"></fm>
              <transclude></transclude>
            </fm>
          `
        });
      });

      it('should throw an error', () => {
        const childForm = compile({
          template: '<fm name="childForm"></fm>',
          scope: T.$scope.$new()
        });

        const childFormCtrl = childForm.controller('fm');

        expect(() => {
          T.fm[RegisterForm](childFormCtrl);
        }).toThrow('another child form with this name already exists');
      });
    });

    describe('when a control with the same name is present', () => {
      const name = 'foo';

      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm name="parentForm">
              <fm-input name="${name}"></fm-input>
              <transclude></transclude>
            </fm>
          `
        });
      });

      it('should throw an error', () => {
        const childForm = compile({
          template: `<fm name="${name}"></fm>`,
          scope: T.$scope.$new()
        });

        const childFormCtrl = childForm.controller('fm');

        expect(() => {
          T.fm[RegisterForm](childFormCtrl);
        }).toThrow('a control with this name already exists');
      });
    });

    describe('configuring the child form', () => {
      const configKey = 'config';
      const childFormName = 'childForm';

      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm name="parentForm" controls="${configKey}">
              <transclude></transclude>
            </fm>
          `,
          scope: {
            [configKey]: {
              [childFormName]: {
                foo: 'bar'
              }
            }
          }
        });
      });

      it('should pass configuration data to the child form', () => {
        // Note: Add tests for this.
      });
    });
  });

  describe('[Interface] RegisterControl', () => {
    it('should implement the RegisterControl interface', () => {
      expect(typeof T.fm[RegisterControl]).toEqual('function');
    });

    describe('with a child form of the same name already registered', () => {
      it('should throw an error', () => {
        const controlName = 'foo';

        expect(() => {
          T = directive('fmInput', {
            template: `<fm-input name="${controlName}"></fm-input>`,
            wrap: `
              <fm name="parentForm">
                <fm name="${controlName}"></fm>
                <transclude></transclude>
              </fm>
            `
          });
        }).toThrow('a child form with this name already exists');
      });
    });
  });

  describe('[Interface] RegisterNgModel', () => {
    const controlName = 'foo';
    const modelValue = 'bar';

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <input type="text" name="${controlName}" ng-model="vm.foo">
          </fm>
        `,
        scope: {
          vm: {
            foo: modelValue
          }
        }
      });

      jest.spyOn(T.fm, RegisterNgModel);

      digest();
    });

    it('should implement the RegisterNgModel interface', () => {
      expect(typeof T.fm[RegisterNgModel]).toEqual('function');
    });

    it('should create a mock control', () => {
      expect(T.fm.getControl(controlName)).toMatchObject({
        name: controlName
      });

      expect(T.fm.getControl(controlName).getModelValue()).toEqual(modelValue);
    });
  });

  describe('[Interface] Configure', () => {
    const formName = 'form';
    const configKey = 'config';
    const controlNameA = 'foo';
    const controlNameB = 'bar';
    const errors = [
      ['required', 'This field is required.']
    ];

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm name="${formName}" controls="${configKey}">
            <fm-input name="${controlNameA}"></fm-input>
            <transclude></transclude>
          </fm>
        `,
        scope: {
          [configKey]: {
            [controlNameA]: {
              errors
            },
            [controlNameB]: {
              errors
            }
          }
        }
      });
    });

    it('should implement the Configure interface', () => {
      expect(typeof T.fm[Configure]).toEqual('function');
    });

    it('should configure known entities', () => {
      expect(T.fm.getControl(controlNameA).getErrorMessages()).toEqual(errors);
    });

    it('should cache configuration data and pass it to newly-registered controls', () => {
      const controlB = compile({
        template: `<fm-input name="${controlNameB}""></fm-input>`,
        insertAt: T.$element.find('transclude')
      }).controller('fmInput');

      expect(controlB.getErrorMessages()).toEqual(errors);
    });

    it('should throw an error if not passed an object', () => {
      expect(() => {
        T.fm[Configure]('foo');
      }).toThrow('expected configuration to be of type Object or Undefined');
    });
  });

  describe('[Interface] GetModelValue / SetModelValue', () => {
    const spies = {};

    const modelValues = {
      foo: 'bar',
      childForm: {
        childFoo: 'bar'
      },
      group: [
        {
          groupedFoo1: 'bar'
        },
        {
          groupedFoo2: 'bar'
        }
      ]
    };

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="foo"></fm-input>
            <fm name="childForm">
              <fm-input name="childFoo"></fm-input>
            </fm>
            <fm-group name="group">
              <fm name="grouped1">
                <fm-input name="groupedFoo1"></fm-input>
              </fm>
              <fm name="grouped2">
                <fm-input name="groupedFoo2"></fm-input>
              </fm>
            </fm-group>
          </fm>
        `
      });

      digest();

      Object.assign(spies, {
        foo: {
          getModelValue: jest.spyOn(T.fm.getControl('foo'), GetModelValue),
          setModelValue: jest.spyOn(T.fm.getControl('foo'), SetModelValue)
        },
        childForm: {
          getModelValue: jest.spyOn(T.fm.getForm('childForm'), GetModelValue),
          setModelValue: jest.spyOn(T.fm.getForm('childForm'), SetModelValue),
          childFoo: {
            getModelValue: jest.spyOn(T.fm.getForm('childForm').getControl('childFoo'), GetModelValue),
            setModelValue: jest.spyOn(T.fm.getForm('childForm').getControl('childFoo'), SetModelValue)
          }
        },
        group: {
          getModelValue: jest.spyOn(T.fm.getForm('group'), GetModelValue),
          setModelValue: jest.spyOn(T.fm.getForm('group'), SetModelValue),
          grouped1: {
            getModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped1'), GetModelValue),
            setModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped1'), SetModelValue),
            groupedFoo1: {
              getModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped1').getControl('groupedFoo1'), GetModelValue),
              setModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped1').getControl('groupedFoo1'), SetModelValue)
            }
          },
          grouped2: {
            getModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped2'), GetModelValue),
            setModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped2'), SetModelValue),
            groupedFoo2: {
              getModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped2').getControl('groupedFoo2'), GetModelValue),
              setModelValue: jest.spyOn(T.fm.getForm('group').getForm('grouped2').getControl('groupedFoo2'), SetModelValue)
            }
          }
        }
      });
    });

    it('should implement the SetModelValue interface', () => {
      expect(typeof T.fm[SetModelValue]).toEqual('function');
    });

    it('should delegate to the SetModelValue interface of registry members', () => {
      T.fm.setModelValues(modelValues);
      digest();

      expect(spies.foo.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.foo.setModelValue.mock.calls[0]).toEqual([modelValues.foo]);

      expect(spies.childForm.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.childForm.setModelValue.mock.calls[0]).toEqual([modelValues.childForm]);

      expect(spies.childForm.childFoo.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.childForm.childFoo.setModelValue.mock.calls[0]).toEqual([modelValues.childForm.childFoo]);

      expect(spies.group.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.setModelValue.mock.calls[0]).toEqual([modelValues.group]);

      expect(spies.group.grouped1.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1.setModelValue.mock.calls[0]).toEqual([modelValues.group[0]]);

      expect(spies.group.grouped1.groupedFoo1.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1.groupedFoo1.setModelValue.mock.calls[0]).toEqual([modelValues.group[0].groupedFoo1]);

      expect(spies.group.grouped2.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2.setModelValue.mock.calls[0]).toEqual([modelValues.group[1]]);

      expect(spies.group.grouped2.groupedFoo2.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2.groupedFoo2.setModelValue.mock.calls[0]).toEqual([modelValues.group[1].groupedFoo2]);
    });

    it('should implement the GetModelValue interface', () => {
      expect(typeof T.fm[GetModelValue]).toEqual('function');
    });

    it('should delegate to the GetModelValue interface of registry members', () => {
      T.fm.setModelValues(modelValues);
      digest();

      const result = T.fm.getModelValues();

      expect(result).toEqual(modelValues);

      // Forms and form groups should have had GetModelValues invoked once.
      expect(spies.childForm.getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1.getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2.getModelValue.mock.calls.length).toEqual(1);

      // Child controls will have had GetModelValue invoked 3 times.
      expect(spies.foo.getModelValue.mock.calls.length).toEqual(3);
      expect(spies.childForm.childFoo.getModelValue.mock.calls.length).toEqual(3);
      expect(spies.group.grouped1.groupedFoo1.getModelValue.mock.calls.length).toEqual(3);
      expect(spies.group.grouped2.groupedFoo2.getModelValue.mock.calls.length).toEqual(3);
    });

    it('SetModelValue should throw an error if not passed an object', () => {
      expect(() => {
        T.fm[SetModelValue]('foo');
      }).toThrow('expected model values to be of type Object or Undefined');
    });
  });

  describe('[Interface] SetCustomErrorMessage', () => {
    const controlName = 'foo';
    const errorMessage = 'bar';
    const errorData = {
      [controlName]: errorMessage
    };

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="${controlName}"></fm-input>
          </fm>
        `
      });
    });

    it('should implement the SetCustomErrorMessage interface', () => {
      expect(typeof T.fm[SetCustomErrorMessage]).toEqual('function');
    });

    it('should assign error messages to known controls', () => {
      expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
      T.fm[SetCustomErrorMessage](errorData);
      expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toEqual(errorMessage);
    });

    it('should throw an error if not passed an object', () => {
      expect(() => {
        T.fm[SetCustomErrorMessage]('foo');
      }).toThrow('expected error messages to be of type Object or Undefined');
    });
  });

  describe('[Interface] ClearCustomErrorMessage', () => {
    const controlName = 'foo';
    const errorMessage = 'bar';

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="${controlName}"></fm-input>
          </fm>
        `
      });

      T.fm.getControl(controlName)[SetCustomErrorMessage](errorMessage);
    });

    it('should implement the ClearCustomErrorMessage interface', () => {
      expect(typeof T.fm[ClearCustomErrorMessage]).toEqual('function');
    });

    it('should clear custom error messages from known controls', () => {
      T.fm[ClearCustomErrorMessage]();
      expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
    });
  });

  describe('[Interface] Reset', () => {
    const controlName = 'foo';
    let resetSpy;

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="${controlName}"></fm-input>
          </fm>
        `
      });

      resetSpy = jest.spyOn(T.fm.getControl(controlName), Reset);
    });

    it('should implement the Reset interface', () => {
      expect(typeof T.fm[Reset]).toEqual('function');
    });

    it('should set the $pristine flag to true', () => {
      T.fm[NG_FORM_CONTROLLER].$setDirty();
      expect(T.fm[NG_FORM_CONTROLLER].$pristine).toBeFalsy();
      T.fm[Reset]();
      expect(T.fm[NG_FORM_CONTROLLER].$pristine).toBeTruthy();
    });

    it('should delegate model values to known controls', () => {
      const value = 'bar';

      const modelValues = {
        [controlName]: value
      };

      T.fm[Reset](modelValues);

      digest();

      expect(T.fm.getControl(controlName)[GetModelValue]()).toEqual(value);
      expect(resetSpy.mock.calls[0]).toEqual([value]);
    });

    it('should throw an error if passed a truthy value that is not an object', () => {
      expect(() => {
        T.fm[Reset]();
      }).not.toThrow();

      expect(() => {
        T.fm[Reset]('foo');
      }).toThrow('expected model values to be of type Object or Undefined');
    });
  });


  // ----- Semi-Private Methods ------------------------------------------------

  describe('$debug', () => {
    const message = 'foo';

    beforeEach(() => {
      T = directive('fm', {
        template: '<fm debug></fm>'
      });
    });

    it('should log debug messages when "$debugging" is true', () => {
      T.fm.$debug(message);
      expect(logSpy.mock.calls[0]).toEqual(expect.arrayContaining([message]));
    });
  });

  describe('$onInit', () => {
    describe('setting the "$debugging" flag', () => {
      describe('when the "debug" attribute is present', () => {
        beforeEach(() => {
          T = directive('fm', {
            template: `<fm debug></fm>`
          });
        });

        it('should set the "$debugging" flag to "true"', () => {
          expect(T.fm.$debugging).toBe(true);
        });
      });

      describe('when the "debug" attribute is absent', () => {
        beforeEach(() => {
          T = directive('fm', {
            template: `<fm></fm>`
          });
        });

        it('should not set the "$debugging" flag to "true"', () => {
          expect(T.fm.$debugging).toBeFalsy();
        });
      });
    });

    describe('assigning "$name" to parent scope', () => {
      describe('when provided a non-empty string', () => {
        const name = 'foo';

        beforeEach(() => {
          T = directive('fm', {
            template: `<fm name="${name}"></fm>`
          });
        });

        it('should assign the form controller to its parent scope', () => {
          expect(T.$scope[name]).toBe(T.fm);
        });
      });

      describe('when provided a falsy value', () => {
        beforeEach(() => {
          T = directive('fm', {
            template: `<fm></fm>`
          });
        });

        it('should assign an auto-generated name', () => {
          expect(T.fm.name).toMatch(new RegExp(`Form-\\d*`));
        });
      });
    });

    describe('parsing "$showErrorsOn"', () => {
      describe('when provided a valid string', () => {
        const attrString = 'touched, submitted';
        const expectedFlags = ['$touched', '$submitted'];

        beforeEach(() => {
          T = directive('fm', {
            template: `<fm show-errors-on="${attrString}"></fm>`
          });
        });

        it('should parse the string into an array of flags', () => {
          expect(T.fm.$getErrorBehavior()).toEqual(expectedFlags);
        });
      });

      describe('when provided a falsy value', () => {
        beforeEach(() => {
          T = directive('fm', {
            template: `<fm></fm>`
          });
        });

        it('should no-op', () => {
          expect(T.fm.$getErrorBehavior()).toBeFalsy();
        });
      });

      describe('when provided an empty string', () => {
        beforeEach(() => {
          T = directive('fm', {
            template: `<fm show-errors-on=""></fm>`
          });
        });

        it('should no-op', () => {
          expect(T.fm.$getErrorBehavior()).toBeFalsy();
        });
      });
    });
  });

  describe('$unregisterControl', () => {
    const controlName = 'foo';

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="${controlName}"></fm-input>
          </fm>
        `
      });
    });

    it('should unregister the named control', () => {
      const control = T.fm.getControl(controlName);
      expect(T.fm.getControl(controlName)).toBeTruthy();

      T.fm.$unregisterControl(control);
      expect(T.fm.getControl(controlName)).toBeFalsy();
    });
  });

  describe('$submit', () => {
    jest.useFakeTimers();

    const controlName = 'foo';

    let onSubmitSpy;
    let disableSpy;
    let enableSpy;
    let setValid;
    let setPending;
    let setSubmitting;

    beforeEach(() => {
      onSubmitSpy = jest.fn();

      T = directive('fm', {
        template: `
          <fm controls="controls" on-submit="onSubmit">
            <fm-input name="${controlName}"></fm-input>
          </fm>
        `,
        scope: {
          onSubmit: onSubmitSpy
        }
      });

      digest();

      // Spy on the form's enable / disable functions.
      disableSpy = jest.spyOn(T.fm, 'disable');
      enableSpy = jest.spyOn(T.fm, 'enable');

      // Set up helpers to manipulate the ngForm controller's $valid and
      // $pending states.
      setValid = value => {
        T.fm[NG_FORM_CONTROLLER].$valid = Boolean(value);
        T.fm[NG_FORM_CONTROLLER].$invalid = !value;
      };

      setPending = value => {
        T.fm[NG_FORM_CONTROLLER].$pending = Boolean(value);
      };

      // Set up a helper to manipulate the form's $submitting state.
      setSubmitting = value => {
        T.fm.$submitting = Boolean(value);
      };
    });


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

        setSubmitting(true);

        return T.fm.$submit().catch(err => {
          expect(err.message).toEqual('SUBMIT_IN_PROGRESS');
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

        setPending(true);
        setValid(false);


        // Queue up a micro-task that will execute as soon as we call
        // runAllTimers().
        setImmediate(() => setPending(false));

        const promise = T.fm.$submit().catch(err => {
          expect(err.message).toEqual('NG_FORM_INVALID');
          expect(disableSpy.mock.calls.length).toBe(1);
          expect(onSubmitSpy.mock.calls.length).toBe(0);
          expect(enableSpy.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        digest();

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
        expect.assertions(3);

        setPending(true);
        setValid(true);

        // Queue up a micro-task that will execute as soon as we call
        // runAllTimers().
        setImmediate(() => setPending(false));

        const promise = T.fm.$submit().then(() => {
          expect(disableSpy.mock.calls.length).toBe(1);
          expect(onSubmitSpy.mock.calls.length).toBe(1);
          expect(enableSpy.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        digest();

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
        expect.assertions(4);

        const fieldError = 'bar';

        const fieldErrors = {
          [controlName]: fieldError
        };

        setPending(false);
        setValid(true);

        T.$scope.onSubmit = jest.fn(() => fieldErrors);

        const promise = T.fm.$submit().then(() => {
          expect(disableSpy.mock.calls.length).toBe(1);
          expect(T.$scope.onSubmit.mock.calls.length).toBe(1);
          expect(enableSpy.mock.calls.length).toBe(1);
          expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBe(fieldError);
        });

        jest.runAllTimers();
        digest();

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

        const error = 'foo';

        setPending(false);
        setValid(true);

        T.$scope.onSubmit = jest.fn(() => Promise.reject(new Error(error)));

        const promise = T.fm.$submit().catch(err => {
          expect(err.message).toBe(error);
          expect(disableSpy.mock.calls.length).toBe(1);
          expect(T.$scope.onSubmit.mock.calls.length).toBe(1);
          expect(enableSpy.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        digest();

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

        const customErrorMessage = 'foo';

        T.fm.getControl(controlName)[SetCustomErrorMessage](customErrorMessage);
        expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBe(customErrorMessage);

        setPending(false);
        setValid(true);

        const promise = T.fm.$submit().then(() => {
          expect(T.fm.getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
          expect(T.fm.getControl(controlName)[NG_MODEL_CTRL].$error[CUSTOM_ERROR_KEY]).toBeFalsy();
          expect(disableSpy.mock.calls.length).toBe(1);
          expect(onSubmitSpy.mock.calls.length).toBe(1);
          expect(enableSpy.mock.calls.length).toBe(1);
        });

        jest.runAllTimers();
        digest();

        return promise;
      });
    });
  });


  // ----- Public Methods ------------------------------------------------------

  describe('isDisabled', () => {
    describe('when "$disabled" is truthy', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `<fm></fm>`
        });

        T.fm.disable();
      });

      it('should return true', () => {
        expect(T.fm.isDisabled()).toBe(true);
      });
    });

    describe('when "$ngDisabled" is truthy', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `<fm ng-disabled="true"></fm>`
        });
      });

      it('should return true', () => {
        expect(T.fm.isDisabled()).toBe(true);
      });
    });

    describe('when neither "$disabled" nor "$ngDisabled" are truthy', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `<fm></fm>`
        });
      });

      it('should return falsy', () => {
        expect(T.fm.isDisabled()).toBeFalsy();
      });
    });
  });

  describe('getControl', () => {
    const ctrlName = 'foo';
    const badName = 'bar';

    beforeEach(() => {
      T = directive('fm', {
        template: `
          <fm>
            <fm-input name="${ctrlName}"></fm-input>
          </fm>
        `
      });
    });

    it('should return the named control, if it exists', () => {
      expect(T.fm.getControl(badName)).toBeFalsy();
      expect(T.fm.getControl(ctrlName)).toBeTruthy();
    });
  });
});
