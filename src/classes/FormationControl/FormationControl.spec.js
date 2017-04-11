import {
  NG_FORM_CONTROLLER
} from '../../components/Form/Form';

import {
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  module,
  get,
  directive
} from '../../../tests/unity';

import {
  ClearCustomErrorMessage,
  Configure,
  GetModelValue,
  RegisterControl,
  RegisterNgModel,
  SetCustomErrorMessage,
  SetModelValue
} from '../../etc/interfaces';

import Formation from '../../index';

import {
  NG_MESSAGES
} from './FormationControl';


// TODO: Move to unity.
function compile ({template, scope} = {}) {
  let $scope;

  if (!scope || !scope.$id) {
    $scope = get('$rootScope').$new();
  } else {
    $scope = scope;
  }

  if (!template || typeof template !== 'string') {
    throw new Error('[createElement] No template provided.');
  }

  return get('$compile')(template)($scope);
}


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

  describe('RegisterNgModel / Form Registration', () => {
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

  describe('$getName', () => {
    describe('when assigned a "name" binding', () => {
      let name = 'foo';

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
      let forStr = 'foo';

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
    let name = 'foo';
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
    let formName = 'foo';
    let controlName = 'bar';

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
    let controlName = 'foo';
    let errors = [
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

  describe('Custom Error Messages', () => {
    let errorMessage = 'foo';

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
  });

  describe('#setModelValue / #getModelValue', () => {
    let modelValue = 'foo';

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
      expect(T.fmInput.getModelValue()).toEqual(modelValue);
    });
  });
});
