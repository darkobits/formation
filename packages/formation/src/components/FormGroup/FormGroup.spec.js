import {
  module,
  compile,
  directive,
  digest
} from '@darkobits/unity';

import {
  RegisterForm,
  Configure,
  GetModelValue,
  SetModelValue,
  SetCustomErrorMessage,
  ClearCustomErrorMessage,
  Reset
} from '../../etc/interfaces';

import Formation from '../../index';

import {
  CUSTOM_ERROR_MESSAGE_KEY
} from '../../classes/FormationControl';


describe('FormGroupController', () => {
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

    T = directive('fmGroup', {
      template: '<fm-group></fm-group>',
      wrap: '<fm></fm>'
    });
  });


  // ----- Interfaces ----------------------------------------------------------

  describe('[Interface] RegisterForm', () => {
    it('should implement the RegisterForm interface', () => {
      expect(typeof T.fmGroup[RegisterForm]).toEqual('function');
    });

    describe('when another child form with the same name is present', () => {
      beforeEach(() => {
        T = directive('fmGroup', {
          template: `
            <fm-group name="formGroup">
              <fm name="childForm"></fm>
            </fm>
          `,
          wrap: '<fm></fm>'
        });
      });

      it('should throw an error', () => {
        const childForm = compile({
          template: '<fm name="childForm"></fm>',
          scope: T.$scope.$new()
        });

        const childFormCtrl = childForm.controller('fm');

        expect(() => {
          T.fmGroup[RegisterForm](childFormCtrl);
        }).toThrow('another child form with this name already exists');
      });
    });

    describe('configuring the child form', () => {
      const configKey = 'config';
      const childFormName = 'childForm';

      beforeEach(() => {
        T = directive('fmGroup', {
          template: `
            <fm-group name="formGroup" controls="${configKey}">
              <transclude></transclude>
            </fm-group>
          `,
          scope: {
            [configKey]: {
              [childFormName]: {
                foo: 'bar'
              }
            }
          },
          wrap: '<fm></fm>'
        });
      });

      it('should pass configuration data to the child form', () => {
        // Note: Add tests for this.
      });
    });
  });

  describe('[Interface] Configure', () => {
    const formGroupName = 'formGroup';
    const childFormA = 'foo';
    const childFormB = 'bar';
    const controlA = 'controlA';
    const controlB = 'controlB';

    const errors = [
      ['foo', 'bar']
    ];

    const config = [
      {
        [controlA]: {
          errors
        }
      },
      {
        [controlB]: {
          errors
        }
      }
    ];

    beforeEach(() => {
      T = directive('fmGroup', {
        template: `
          <fm-group name="${formGroupName}">
            <fm name="${childFormA}">
              <fm-input name="${controlA}"></fm-input>
            </fm>
            <transclude></transclude>
          </fm-group>
        `,
        wrap: '<fm></fm>'
      });

      T.fmGroup[Configure](config);
    });

    it('should implement the Configure interface', () => {
      expect(typeof T.fmGroup[Configure]).toEqual('function');
    });

    it('should throw an error when not passed an array', () => {
      expect(() => {
        T.fmGroup[Configure]('foo');
      }).toThrow('expected configuration to be of type Array or Undefined');
    });

    it('should configure known entities', () => {
      expect(T.fmGroup.getForm(childFormA).getControl(controlA).getErrorMessages()).toEqual(errors);
    });

    it('should cache configuration data and pass it to newly-registered forms', () => {
      compile({
        template: `
          <fm name="${childFormB}">
            <fm-input name="${controlB}""></fm-input>
          </fm>
        `,
        insertAt: T.$element.find('transclude')
      });

      expect(T.fmGroup.getForm(childFormB).getControl(controlB).getErrorMessages()).toEqual(errors);
    });
  });

  describe('[Interface] GetModelValue / SetModelValue', () => {
    const spies = {};
    const controlA = 'controlA';
    const controlB = 'controlB';

    const modelValues = [
      {
        [controlA]: 'bar'
      },
      {
        [controlB]: 'bar'
      }
    ];

    beforeEach(() => {
      T = directive('fmGroup', {
        template: `
          <fm-group name="group">
            <fm name="grouped1">
              <fm-input name="${controlA}"></fm-input>
            </fm>
            <fm name="grouped2">
              <fm-input name="${controlB}"></fm-input>
            </fm>
          </fm-group>
        `,
        wrap: '<fm></fm>'
      });

      digest();

      Object.assign(spies, {
        group: {
          getModelValue: jest.spyOn(T.fmGroup, GetModelValue),
          setModelValue: jest.spyOn(T.fmGroup, SetModelValue),
          grouped1: {
            getModelValue: jest.spyOn(T.fmGroup.getForm('grouped1'), GetModelValue),
            setModelValue: jest.spyOn(T.fmGroup.getForm('grouped1'), SetModelValue),
            [controlA]: {
              getModelValue: jest.spyOn(T.fmGroup.getForm('grouped1').getControl(controlA), GetModelValue),
              setModelValue: jest.spyOn(T.fmGroup.getForm('grouped1').getControl(controlA), SetModelValue)
            }
          },
          grouped2: {
            getModelValue: jest.spyOn(T.fmGroup.getForm('grouped2'), GetModelValue),
            setModelValue: jest.spyOn(T.fmGroup.getForm('grouped2'), SetModelValue),
            [controlB]: {
              getModelValue: jest.spyOn(T.fmGroup.getForm('grouped2').getControl(controlB), GetModelValue),
              setModelValue: jest.spyOn(T.fmGroup.getForm('grouped2').getControl(controlB), SetModelValue)
            }
          }
        }
      });
    });

    it('should implement the SetModelValue interface', () => {
      expect(typeof T.fmGroup[SetModelValue]).toEqual('function');
    });

    it('should delegate to the SetModelValue interface of registry members', () => {
      T.fmGroup[SetModelValue](modelValues);
      digest();

      expect(spies.group.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.setModelValue.mock.calls[0]).toEqual([modelValues]);

      expect(spies.group.grouped1.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1.setModelValue.mock.calls[0]).toEqual([modelValues[0]]);

      expect(spies.group.grouped1[controlA].setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1[controlA].setModelValue.mock.calls[0]).toEqual([modelValues[0][controlA]]);

      expect(spies.group.grouped2.setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2.setModelValue.mock.calls[0]).toEqual([modelValues[1]]);

      expect(spies.group.grouped2[controlB].setModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2[controlB].setModelValue.mock.calls[0]).toEqual([modelValues[1][controlB]]);
    });

    it('should implement the GetModelValue interface', () => {
      expect(typeof T.fmGroup[GetModelValue]).toEqual('function');
    });

    it('should delegate to the GetModelValue interface of registry members', () => {
      T.fmGroup.setModelValues(modelValues);
      digest();

      const result = T.fmGroup[GetModelValue]();

      expect(result).toEqual(modelValues);

      // Forms and form groups should have had GetModelValues invoked once.
      expect(spies.group.getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped1.getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2.getModelValue.mock.calls.length).toEqual(1);

      // Child controls will have had GetModelValue invoked 3 times.
      expect(spies.group.grouped1[controlA].getModelValue.mock.calls.length).toEqual(1);
      expect(spies.group.grouped2[controlB].getModelValue.mock.calls.length).toEqual(1);
    });

    it('SetModelValue should throw an error if not passed an array', () => {
      expect(() => {
        T.fmGroup[SetModelValue]('foo');
      }).toThrow('expected model values to be of type Array or Undefined');
    });
  });

  describe('[Interface] SetCustomErrorMessage', () => {
    const formName = 'foo';
    const controlName = 'control';
    const errorMessage = 'bar';
    const errorData = [
      {
        [controlName]: errorMessage
      }
    ];

    beforeEach(() => {
      T = directive('fmGroup', {
        template: `
          <fm-group>
            <fm name="${formName}">
              <fm-input name="${controlName}"></fm-input>
            </fm>
          </fm-group>
        `,
        wrap: '<fm></fm>'
      });
    });

    it('should implement the SetCustomErrorMessage interface', () => {
      expect(typeof T.fmGroup[SetCustomErrorMessage]).toEqual('function');
    });

    it('should delegate to the SetCustomErrorMessage interface of known registry members', () => {
      expect(T.fmGroup.getForm(formName).getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
      T.fmGroup[SetCustomErrorMessage](errorData);
      expect(T.fmGroup.getForm(formName).getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toEqual(errorMessage);
    });

    it('should throw an error if not passed an array', () => {
      expect(() => {
        T.fmGroup[SetCustomErrorMessage]('foo');
      }).toThrow('expected error messages to be of type Array or Undefined');
    });
  });

  describe('[Interface] ClearCustomErrorMessage', () => {
    const formName = 'foo';
    const controlName = 'control';
    const errorMessage = 'bar';

    beforeEach(() => {
      T = directive('fmGroup', {
        template: `
          <fm-group>
            <fm name="${formName}">
              <fm-input name="${controlName}"></fm-input>
            </fm>
          </fm-group>
        `,
        wrap: '<fm></fm>'
      });

      T.fmGroup.getForm(formName).getControl(controlName)[SetCustomErrorMessage](errorMessage);
    });

    it('should implement the ClearCustomErrorMessage interface', () => {
      expect(typeof T.fmGroup[ClearCustomErrorMessage]).toEqual('function');
    });

    it('should clear custom error messages from registry members', () => {
      T.fmGroup[ClearCustomErrorMessage]();
      expect(T.fmGroup.getForm(formName).getControl(controlName)[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
    });
  });

  describe('[Interface] Reset', () => {
    const formName = 'foo';
    const controlName = 'control';
    let resetSpy;

    beforeEach(() => {
      T = directive('fmGroup', {
        template: `
          <fm-group>
            <fm name="${formName}">
              <fm-input name="${controlName}"></fm-input>
            </fm>
          </fm-group>
        `,
        wrap: '<fm></fm>'
      });

      resetSpy = jest.spyOn(T.fmGroup.getForm(formName).getControl(controlName), Reset);
    });

    it('should implement the Reset interface', () => {
      expect(typeof T.fmGroup[Reset]).toEqual('function');
    });

    it('should delegate model values to known controls', () => {
      const value = 'bar';

      const modelValues = [
        {
          [controlName]: value
        }
      ];

      T.fmGroup[Reset](modelValues);

      digest();

      expect(T.fmGroup.getForm(formName).getControl(controlName)[GetModelValue]()).toEqual(value);
      expect(resetSpy.mock.calls[0]).toEqual([value]);
    });

    it('should throw an error if passed a truthy value that is not an array', () => {
      expect(() => {
        T.fmGroup[Reset]();
      }).not.toThrow();

      expect(() => {
        T.fmGroup[Reset]('foo');
      }).toThrow('expected model values to be of type Array or Undefined');
    });
  });


  // ----- Semi-Private Methods ------------------------------------------------

  describe('$debug', () => {
    const message = 'foo';

    beforeEach(() => {
      T = directive('fmGroup', {
        template: '<fm-group debug></fm-group>',
        wrap: '<fm></fm>'
      });
    });

    it('should log debug messages when "$debugging" is true', () => {
      T.fmGroup.$debug(message);
      expect(logSpy.mock.calls[0]).toEqual(expect.arrayContaining([message]));
    });
  });


  // ----- Public Methods ------------------------------------------------------

  describe('isDisabled', () => {
    describe('when "$disabled" is truthy', () => {
      beforeEach(() => {
        T.fmGroup.disable();
      });

      it('should return true', () => {
        expect(T.fmGroup.isDisabled()).toBe(true);
      });
    });

    describe('when "$ngDisabled" is truthy', () => {
      beforeEach(() => {
        T = directive('fmGroup', {
          template: '<fm-group ng-disabled="true"></fm-group>',
          wrap: '<fm></fm>'
        });
      });

      it('should return true', () => {
        expect(T.fmGroup.isDisabled()).toBe(true);
      });
    });

    describe('when neither "$disabled" nor "$ngDisabled" are truthy', () => {
      it('should return falsy', () => {
        expect(T.fmGroup.isDisabled()).toBeFalsy();
      });
    });
  });
});
