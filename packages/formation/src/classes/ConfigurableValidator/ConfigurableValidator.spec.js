import {
  module,
  directive,
  compile
} from '@darkobits/unity';

import {
  CONFIGURABLE_VALIDATOR,
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
        .toThrow('expected validator to be of type Function');
    });

    it('should assign a bound copy of the provided function to itself', () => {
      function myValidator () { }
      const V = new ConfigurableValidator(myValidator);
      expect(V.validator.name).toMatch('bound myValidator');
    });

    it('should assign the CONFIGURABLE_VALIDATOR value to itself', () => {
      const V = new ConfigurableValidator(() => {});
      expect(V[CONFIGURABLE_VALIDATOR]).toBe(true);
    });
  });

  describe('#configure', () => {
    let Form;
    let T;
    let V;

    beforeEach(() => {
      module(Formation);

      const wrapper = compile({
        template: '<fm></fm>'
      });

      Form = wrapper.controller('fm');

      T = directive('fmInput', {
        template: '<fm-input></fm-input>',
        wrap: wrapper
      });

      V = new ConfigurableValidator(() => {});

      V.configure(T.fmInput);
    });

    it('should assign a reference to the form', () => {
      expect(V.form).toBe(Form);
    });

    it('should assign a reference to the forms scope', () => {
      expect(V.scope.$id).toBeTruthy();
    });

    it('should assign a reference to the controls ngModel controller', () => {
      expect(V.ngModelCtrl).toEqual(T.fmInput[NG_MODEL_CTRL]);
    });
  });
});
