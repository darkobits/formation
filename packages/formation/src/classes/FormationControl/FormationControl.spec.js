import {
  last
} from 'ramda';

import {
  module,
  compile,
  directive,
  digest
} from '@darkobits/unity';

import {
  NG_FORM_CONTROLLER
} from '../../components/Form/Form';

import {
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  ClearCustomErrorMessage,
  Configure,
  GetModelValue,
  RegisterControl,
  RegisterNgModel,
  Reset,
  SetCustomErrorMessage,
  SetModelValue
} from '../../etc/interfaces';

import Formation from '../../index';

import {
  NG_MESSAGES
} from './FormationControl';


describe('FormationControl', () => {
  let T;
  let Form;
  let wrapper;

  beforeEach(() => {
    module(Formation);

    wrapper = compile({
      template: '<fm></fm>'
    });

    Form = wrapper.controller('fm');
    jest.spyOn(Form, RegisterControl);
  });



  describe('$getName', () => {
    describe('when assigned a "name" binding', () => {
      const name = 'foo';

      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input name="${name}"></fm-input>`,
          wrap: wrapper
        });
      });

      it('should report its name', () => {
        expect(T.fmInput.$getName()).toEqual(name);
      });
    });

    describe('when assigned a "for" binding', () => {
      const forStr = 'foo';

      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input name="${forStr}"></fm-input>`,
          wrap: wrapper
        });
      });

      it('should report its name', () => {
        expect(T.fmInput.$getName()).toEqual(forStr);
      });
    });
  });

  describe('$onDestroy', () => {
    let unregisterSpy;

    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input></fm-input>`,
        wrap: wrapper
      });

      unregisterSpy = jest.spyOn(Form, '$unregisterControl');
    });

    it('should unregister from its form controller if it has a model', () => {
      T.fmInput.$onDestroy();
      expect(unregisterSpy.mock.calls[0][0]).toEqual(T.fmInput);
    });
  });

  describe('#isDisabled', () => {
    describe('when not disabled', () => {
      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });
      });

      it('should return false', () => {
        expect(T.fmInput.isDisabled()).toBeFalsy();
      });
    });

    describe('with a truthy ngDisabled binding', () => {
      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input ng-disabled="true"></fm-input>`,
          wrap: wrapper
        });
      });

      it('should return false', () => {
        expect(T.fmInput.isDisabled()).toBeTruthy();
      });
    });

    describe('when programatically disabled', () => {
      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput.disable();
      });

      it('should return false', () => {
        expect(T.fmInput.isDisabled()).toBeTruthy();
      });
    });

    describe('when the form is disabled', () => {
      beforeEach(() => {
        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        Form.disable();
      });

      it('should return false', () => {
        expect(T.fmInput.isDisabled()).toBeTruthy();
      });
    });
  });

  describe('$getControl', () => {
    const name = 'foo';
    let getControlSpy;

    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input name="${name}"></fm-input>`,
        wrap: wrapper
      });

      getControlSpy = jest.spyOn(Form, 'getControl');
    });

    it('should attempt to get the correct control from the form', () => {
      expect(T.fmInput.$getControl()).toEqual(T.fmInput);
      expect(getControlSpy.mock.calls[0][0]).toEqual(name);
    });
  });

  describe('#getControlId', () => {
    const formName = 'foo';
    const controlName = 'bar';

    beforeEach(() => {
      wrapper = compile({
        template: `<fm name="${formName}"></fm>`
      });

      Form = wrapper.controller('fm');

      T = directive('fmInput', {
        template: `<fm-input name="${controlName}"></fm-input>`,
        wrap: wrapper
      });
    });

    it('should return its ID', () => {
      expect(T.fmInput.getControlId()).toEqual(`${formName}-${controlName}-0`);
    });
  });

  describe('#enable / #disable', () => {
    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input></fm-input>`,
        wrap: wrapper
      });
    });

    it('should enable / disable the control', () => {
      T.fmInput.disable();
      expect(T.fmInput.isDisabled()).toBeTruthy();
      T.fmInput.enable();
      expect(T.fmInput.isDisabled()).toBeFalsy();
    });
  });

  describe('#getErrors', () => {
    /**
     * Scenario 1
     *
     * - [ ] Control is invalid
     * - [X] Show errors on $touched
     * - [X] Show errors on $submitted
     * - [ ] Control has been touched
     * - [ ] Form has been submitted
     */
    describe('Scenario 1', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm show-errors-on="touched, submitted"></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = true;
        T.fmInput[NG_MODEL_CTRL].$touched = false;
      });

      it('should return false', () => {
        expect(T.fmInput.getErrors()).toBeFalsy();
      });
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
    describe('Scenario 2', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm show-errors-on="touched, submitted"></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = false;
      });

      it('should return false', () => {
        expect(T.fmInput.getErrors()).toBeFalsy();
      });
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
    describe('Scenario 3', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm show-errors-on="touched"></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = false;
      });

      it('should return false', () => {
        expect(T.fmInput.getErrors()).toBeFalsy();
      });
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
    describe('Scenario 4', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = false;
      });

      it('should return errors', () => {
        expect(T.fmInput.getErrors()).toBeTruthy();
      });
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
    describe('Scenario 5', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm show-errors-on="submitted"></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = false;
        T.fmInput[NG_MODEL_CTRL].$touched = true;
      });

      it('should return false', () => {
        expect(T.fmInput.getErrors()).toBeFalsy();
      });
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
    describe('Scenario 6', () => {
      beforeEach(() => {
        wrapper = compile({
          template: '<fm show-errors-on="submitted"></fm>'
        });

        Form = wrapper.controller('fm');

        T = directive('fmInput', {
          template: `<fm-input></fm-input>`,
          wrap: wrapper
        });

        T.fmInput[NG_MODEL_CTRL].$valid = false;
        Form[NG_FORM_CONTROLLER].$submitted = true;
      });

      it('should return errors', () => {
        expect(T.fmInput.getErrors()).toBeTruthy();
      });
    });
  });

  describe('#getErrorMessages', () => {
    const controlName = 'foo';
    const errors = [
      ['foo', 'bar']
    ];

    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input name="${controlName}"></fm-input>`,
        wrap: wrapper
      });

      T.fmInput[Configure]({errors});
    });

    it('should assign error messages to the correct key', () => {
      expect(T.fmInput[NG_MESSAGES]).toEqual(errors);
    });

    it('should return its configured error messages', () => {
      expect(T.fmInput.getErrorMessages()).toEqual(errors);
    });
  });


  // ----- Interfaces ----------------------------------------------------------

  describe('[Interface] Configure', () => {
    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input></fm-input>`,
        wrap: wrapper
      });
    });

    describe('applying error messages', () => {
      it('should ensure each error is a tuple', () => {
        expect(() => {
          T.fmInput[Configure]({
            errors: [
              null,
              null,
              'foo'
            ]
          });
        }).toThrow('Expected error message tuple to be an array of length 2');
      });

      it('should not overwrite matching error tuples', () => {
        const error1 = ['foo', 'bar'];
        const error2 = ['foo', 'bar'];

        T.fmInput[Configure]({
          errors: [
            error1
          ]
        });

        T.fmInput[Configure]({
          errors: [
            error2
          ]
        });

        expect(T.fmInput.getErrorMessages().length).toBe(1);
      });
    });

    describe('applying parsers', () => {
      it('should ensure each parser is a function', () => {
        expect(() => {
          T.fmInput[Configure]({
            parsers: [
              null,
              null,
              'foo'
            ]
          });
        }).toThrow('Expected parser to be of type "Function"');
      });

      it('should push parsers onto $parsers', () => {
        const parser = () => {};

        T.fmInput[Configure]({
          parsers: [parser]
        });

        // The actual function pushed onto $parsers will be a bound version of
        // the original.
        expect(last(T.fmInput[NG_MODEL_CTRL].$parsers).name).toMatch('bound parser');
      });
    });

    describe('applying formatters', () => {
      it('should ensure each formatter is a function', () => {
        expect(() => {
          T.fmInput[Configure]({
            formatters: [
              null,
              null,
              'foo'
            ]
          });
        }).toThrow('Expected formatter to be of type "Function"');
      });

      it('should push formatters onto $formatters', () => {
        function formatter () { }

        T.fmInput[Configure]({
          formatters: [formatter]
        });

        // The actual function pushed onto $formatters will be a bound version of
        // the original.
        expect(last(T.fmInput[NG_MODEL_CTRL].$formatters).name).toMatch('bound formatter');
      });
    });

    describe('applying validators', () => {
      it('should ensure each validator is a function', () => {
        expect(() => {
          T.fmInput[Configure]({
            validators: {
              foo: null,
              bar: null
            }
          });
        }).toThrow('Expected validator to be of type "Function"');
      });

      it('should add validators to $validators', () => {
        function validator () { }

        T.fmInput[Configure]({
          validators: {validator}
        });

        // The actual function added to $validators will be a bound version of
        // the original.
        expect(T.fmInput[NG_MODEL_CTRL].$validators.validator.name).toMatch('bound validator');
      });
    });

    describe('applying async validators', () => {
      it('should ensure each async validator is a function', () => {
        expect(() => {
          T.fmInput[Configure]({
            asyncValidators: {
              foo: null,
              bar: null
            }
          });
        }).toThrow('Expected async validator to be of type "Function"');
      });

      it('should add async validators to $asyncValidators', () => {
        function asyncValidator () {
          return Promise.resolve();
        }

        T.fmInput[Configure]({
          asyncValidators: {asyncValidator}
        });

        // The actual function added to $asyncValidator will be a bound version of
        // the original.
        expect(T.fmInput[NG_MODEL_CTRL].$asyncValidators.asyncValidator.name).toMatch('bound asyncValidator');
      });
    });

    describe('applying ngModelOptions', () => {
      it('should configure ngModelOptions', () => {
        const options = {
          updateOn: 'blur',
          allowInvalid: true
        };

        T.fmInput[Configure]({
          ngModelOptions: options
        });

        expect(T.fmInput[NG_MODEL_CTRL].$options.$$options).toEqual(expect.objectContaining(options));
      });
    });
  });

  describe('[Interface] RegisterNgModel / Form Registration', () => {
    beforeEach(() => {
      T = directive('fmInput', {
        template: '<fm-input></fm-input>',
        wrap: wrapper
      });
    });

    it('should implement the RegisterNgModel interface', () => {
      expect(typeof T.fmInput[RegisterNgModel]).toEqual('function');
    });

    it('should register with the form', () => {
      expect(Form[RegisterControl].mock.calls[0][0]).toEqual(T.fmInput);
    });

    it('should assign its ngModel controller to the correct key', () => {
      expect(T.fmInput[NG_MODEL_CTRL]).toBeTruthy();
    });
  });

  describe('[Interface] SetModelValue / GetModelValue', () => {
    const modelValue = 'foo';

    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input></fm-input>`,
        wrap: wrapper
      });
    });

    it('should implement the SetModelValue interface', () => {
      expect(typeof T.fmInput[SetModelValue]).toEqual('function');
    });

    it('should implement the GetModelValue interface', () => {
      expect(typeof T.fmInput[GetModelValue]).toEqual('function');
    });

    it('should get/set the controls model value', () => {
      T.fmInput.setModelValue(modelValue);
      digest();

      expect(T.fmInput.getModelValue()).toEqual(modelValue);
    });

    it('should no-op when passed "undefined"', () => {
      T.fmInput.setModelValue(modelValue);
      digest();

      expect(T.fmInput.getModelValue()).toEqual(modelValue);

      T.fmInput.setModelValue();
      digest();

      expect(T.fmInput.getModelValue()).toEqual(modelValue);
    });
  });

  describe('[Interface] SetCustomErrorMessage / ClearCustomErrorMessage', () => {
    const errorMessage = 'foo';

    beforeEach(() => {
      T = directive('fmInput', {
        template: `<fm-input></fm-input>`,
        wrap: wrapper
      });
    });

    it('should implmenet SetCustomErrorMessage', () => {
      expect(typeof T.fmInput[SetCustomErrorMessage]).toEqual('function');
    });

    it('getCustomErrorMessage should return the current custom errror', () => {
      T.fmInput[SetCustomErrorMessage](errorMessage);
      expect(T.fmInput.getCustomErrorMessage()).toEqual(errorMessage);
    });

    it('should implmenet ClearCustomErrorMessage', () => {
      expect(typeof T.fmInput[ClearCustomErrorMessage]).toEqual('function');
      T.fmInput[SetCustomErrorMessage](errorMessage);
      expect(T.fmInput.getCustomErrorMessage()).toEqual(errorMessage);
      T.fmInput[ClearCustomErrorMessage]();
      expect(T.fmInput.getCustomErrorMessage()).toBeFalsy();
    });

    it('SetCustomErrorMessage should throw an error if not passed a string', () => {
      expect(() => {
        T.fmInput[SetCustomErrorMessage]({});
      }).toThrow('Expected error message to be of type "String"');
    });
  });

  describe('[Interface] Reset', () => {
    beforeEach(() => {
      T = directive('fmInput', {
        template: '<fm-input name="foo"></fm-input>',
        wrap: wrapper
      });
    });

    it('should implement the Reset interface', () => {
      expect(typeof T.fmInput[Reset]).toEqual('function');
    });

    it('should set the control to an untouched, pristine state', () => {
      T.fmInput[NG_MODEL_CTRL].$setDirty();
      T.fmInput[NG_MODEL_CTRL].$setTouched();

      T.fmInput[Reset]();

      expect(T.fmInput[NG_MODEL_CTRL].$dirty).toBeFalsy();
      expect(T.fmInput[NG_MODEL_CTRL].$touched).toBeFalsy();
    });

    it('should validate the control', () => {
      const validateSpy = jest.spyOn(T.fmInput[NG_MODEL_CTRL], '$validate');
      T.fmInput[Reset]();
      expect(validateSpy.mock.calls.length).toBe(1);
    });

    it('if provided a non-undefined value, it should set the its model value', () => {
      const value = 'foo';
      expect(T.fmInput[GetModelValue]()).toBeFalsy();
      T.fmInput[Reset](value);
      digest();
      expect(T.fmInput[GetModelValue]()).toBe(value);
    });
  });
});
