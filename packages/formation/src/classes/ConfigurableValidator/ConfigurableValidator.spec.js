import {
  module,
  directive,
  compile
} from '@darkobits/unity';

import {
  CONFIGURABLE_VALIDATOR,
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import Formation from '../../index';

import {
  ConfigurableValidator
} from './ConfigurableValidator';

describe('ConfigurableValidator', () => {
  describe('creating configurable validators', () => {
    it('should throw an error if not provided a function', () => {
      expect(() => new ConfigurableValidator(null))
        .toThrow('expected validator configurator to be of type Function');
    });

    it('should assign the CONFIGURABLE_VALIDATOR value to itself', () => {
      const V = ConfigurableValidator(() => {});
      expect(V[CONFIGURABLE_VALIDATOR]).toBe(true);
    });
  });

  describe('#configure', () => {
    let Form;
    let control;
    let configurableValidator;
    let validatorFn;

    beforeEach(() => {
      module(Formation);

      const wrapper = compile({
        template: '<fm></fm>'
      });

      Form = wrapper.controller('fm');

      control = directive('fmInput', {
        template: '<fm-input></fm-input>',
        wrap: wrapper
      });

      configurableValidator = ConfigurableValidator(({form, ngModelCtrl, scope}) => {
        return modelValue => {
          switch (modelValue) {
            case 'form':
              return form;
            case 'ngModelCtrl':
              return ngModelCtrl;
            case 'scope':
              return scope;
            default:
              return true;
          }
        };
      });

      validatorFn = configurableValidator(control.fmInput);
    });

    it('should return a function once configured', () => {
      expect(typeof validatorFn).toBe('function');
    });

    it('should make the form available to the validator function', () => {
      expect(validatorFn('form')).toBe(Form);
    });

    it('should make the forms scope available to the validator function', () => {
      expect(validatorFn('scope').$id).toBeTruthy();
    });

    it('should make the controls ngModel controller available to the validator function', () => {
      expect(validatorFn('ngModelCtrl')).toEqual(control.fmInput[NG_MODEL_CTRL]);
    });
  });

  describe('malformed validators', () => {
    it('should throw an error if a function is not returned upon configuration', () => {
      expect(() => {
        const configurableValidator = ConfigurableValidator(() => false);

        configurableValidator({
          [FORM_CONTROLLER]: {
            $getScope () { }
          }
        });
      }).toThrow('expected validator to be of type Function, but got Boolean');
    });
  });
});
