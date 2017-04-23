import {
  module,
  compile,
  directive
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

import Formation from '../../index';

import {
  NG_FORM_CONTROLLER
} from './Form';


describe('FormController', () => {
  let T;

  beforeEach(() => {
    module(Formation);

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
  });

  describe('[Interface] GetModelValue', () => {
    it('should implement the GetModelValue interface', () => {
      expect(typeof T.fm[GetModelValue]).toEqual('function');
    });
  });

  describe('[Interface] SetModelValue', () => {
    it('should implement the SetModelValue interface', () => {
      expect(typeof T.fm[SetModelValue]).toEqual('function');
    });
  });

  describe('[Interface] SetCustomErrorMessage', () => {
    it('should implement the SetCustomErrorMessage interface', () => {
      expect(typeof T.fm[SetCustomErrorMessage]).toEqual('function');
    });
  });

  describe('[Interface] ClearCustomErrorMessage', () => {
    it('should implement the ClearCustomErrorMessage interface', () => {
      expect(typeof T.fm[ClearCustomErrorMessage]).toEqual('function');
    });
  });

  describe('[Interface] Reset', () => {
    it('should implement the Reset interface', () => {
      expect(typeof T.fm[Reset]).toEqual('function');
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

  // describe('$unregisterControl', () => {
  //   let ctrlName = 'foo';
  //   let form = createForm();
  //   let ctrl = {
  //     name: ctrlName,
  //     [NG_MODEL_CTRL]: ngModelCtrl({
  //       $name: ctrlName
  //     })
  //   };

  //   form.$registerControl(ctrl);

  //   it('should unregister the named control', () => {
  //     expect(form.getControl(ctrlName)).toBe(ctrl);
  //     form.$unregisterControl(ctrl);
  //     expect(form.getControl(ctrlName)).toBeFalsy();
  //   });
  // });

  // describe('$debug', () => {
  //   it('should log debug messages when "$debugging" is true', () => {
  //     let spy = jest.fn();
  //     let message = 'foo';
  //     let form = createForm({}, {
  //       $attrs: {
  //         debug: true
  //       },
  //       $log: {
  //         log: spy
  //       }
  //     });

  //     form.$onInit();
  //     form.$debug(message);
  //     expect(spy.mock.calls[0]).toEqual(expect.arrayContaining([message]));
  //   });
  // });

  // describe('$submit', () => {
  //   function onSubmitForm () {
  //     let onSubmitReturn;

  //     let onSubmitSpy = jest.fn(() => {
  //       return onSubmitReturn;
  //     });

  //     let form = createForm({
  //       $onSubmit: onSubmitSpy,
  //       $submitting: false,
  //       [NG_FORM_CONTROLLER]: {
  //         $valid: true,
  //         $pending: false
  //       }
  //     });

  //     // Spy on the disable() method.
  //     let origDisable = form.disable;
  //     let disableSpy = jest.fn(() => {
  //       origDisable();
  //     });
  //     form.disable = disableSpy;

  //     // Spy on the enable() method.
  //     let origEnable = form.enable;
  //     let enableSpy = jest.fn(() => {
  //       origEnable();
  //     });
  //     form.enable = enableSpy;

  //     form.$onInit();

  //     return {
  //       form,
  //       spies: {
  //         onSubmit: onSubmitSpy,
  //         enable: enableSpy,
  //         disable: disableSpy
  //       },
  //       valid (value) {
  //         form[NG_FORM_CONTROLLER].$valid = value;
  //       },
  //       pending (value) {
  //         form[NG_FORM_CONTROLLER].$pending = value;
  //       },
  //       submitting (value) {
  //         form.$submitting = value;
  //       },
  //       onSubmitReturn (value) {
  //         onSubmitReturn = value;
  //       }
  //     };
  //   }


  //   /**
  //    * Scenario 1
  //    *
  //    * - [X] Form is already submitting
  //    * - [ ] Form has pending async validators
  //    * - [ ] Form is valid
  //    * - [ ] Control has a custom error set
  //    * - [ ] onSubmit returned field errors
  //    */
  //   describe('Scenario 1', () => {
  //     it('should return immediately', () => {
  //       expect.assertions(1);

  //       let test = onSubmitForm();
  //       test.submitting(true);

  //       return test.form.$submit().catch(err => {
  //         expect(err.message).toBe('SUBMIT_IN_PROGRESS');
  //       });
  //     });
  //   });


  //   /**
  //    * Scenario 2
  //    *
  //    * - [ ] Form is already submitting
  //    * - [X] Form has pending async validators
  //    * - [ ] Form is valid
  //    * - [ ] Control has a custom error set
  //    * - [ ] onSubmit returned field errors
  //    */
  //   describe('Scenario 2', () => {
  //     it('should wait until $pending is "false"', () => {
  //       expect.assertions(4);

  //       let test = onSubmitForm();
  //       test.pending(true);
  //       test.valid(false);
  //       setImmediate(() => test.pending(false));

  //       let promise = test.form.$submit().catch(err => {
  //         expect(err.message).toBe('NG_FORM_INVALID');
  //         expect(test.spies.disable.mock.calls.length).toBe(1);
  //         expect(test.spies.onSubmit.mock.calls.length).toBe(0);
  //         expect(test.spies.enable.mock.calls.length).toBe(1);
  //       });

  //       jest.runAllTimers();
  //       return promise;
  //     });
  //   });


  //   /**
  //    * Scenario 3
  //    *
  //    * - [ ] Form is already submitting
  //    * - [X] Form has pending async validators
  //    * - [X] Form is valid
  //    * - [ ] Control has a custom error set
  //    * - [ ] onSubmit returned field errors
  //    */
  //   describe('Scenario 3', () => {
  //     it('should wait until $pending is false, then call onSubmit', () => {
  //       expect.assertions(4);

  //       let test = onSubmitForm();
  //       test.pending(true);
  //       test.valid(true);
  //       setImmediate(() => test.pending(false));

  //       let promise = test.form.$submit().then(result => {
  //         expect(result).toBe('SUBMIT_COMPLETE');
  //         expect(test.spies.disable.mock.calls.length).toBe(1);
  //         expect(test.spies.onSubmit.mock.calls.length).toBe(1);
  //         expect(test.spies.enable.mock.calls.length).toBe(1);
  //       });

  //       jest.runAllTimers();
  //       return promise;
  //     });
  //   });


  //   /**
  //    * Scenario 4
  //    *
  //    * - [ ] Form is already submitting
  //    * - [ ] Form has pending async validators
  //    * - [X] Form is valid
  //    * - [ ] Control has a custom error set
  //    * - [X] onSubmit returned a promise
  //    */
  //   describe('Scenario 4', () => {
  //     it('should call onSubmit and apply field errors', () => {
  //       expect.assertions(5);

  //       let ctrlName = 'foo';
  //       let fieldError = 'bar';

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       let fieldErrors = {
  //         [ctrlName]: fieldError
  //       };

  //       let test = onSubmitForm();
  //       test.pending(false);
  //       test.valid(true);
  //       test.onSubmitReturn(fieldErrors);
  //       test.form.$registerControl(ctrl);

  //       let promise = test.form.$submit().then(result => {
  //         expect(result).toBe('SUBMIT_COMPLETE');
  //         expect(test.spies.disable.mock.calls.length).toBe(1);
  //         expect(test.spies.onSubmit.mock.calls.length).toBe(1);
  //         expect(test.spies.enable.mock.calls.length).toBe(1);
  //         expect(ctrl[CUSTOM_ERROR_MESSAGE_KEY]).toBe(fieldError);
  //       });

  //       jest.runAllTimers();
  //       return promise;
  //     });
  //   });


  //   /**
  //    * Scenario 5
  //    *
  //    * - [ ] Form is already submitting
  //    * - [ ] Form has pending async validators
  //    * - [X] Form is valid
  //    * - [ ] Control has a custom error set
  //    * - [ ] onSubmit returned field errors
  //    */
  //   describe('Scenario 5', () => {
  //     it('should indicate that onSubmit did not catch', () => {
  //       expect.assertions(4);

  //       let test = onSubmitForm();
  //       test.pending(false);
  //       test.valid(true);
  //       test.onSubmitReturn(Promise.reject({}));

  //       let promise = test.form.$submit().catch(err => {
  //         expect(err.message).toBe('CONSUMER_REJECTED');
  //         expect(test.spies.disable.mock.calls.length).toBe(1);
  //         expect(test.spies.onSubmit.mock.calls.length).toBe(1);
  //         expect(test.spies.enable.mock.calls.length).toBe(1);
  //       });

  //       jest.runAllTimers();
  //       return promise;
  //     });
  //   });


  //   /**
  //    * Scenario 6
  //    *
  //    * - [ ] Form is already submitting
  //    * - [ ] Form has pending async validators
  //    * - [ ] Form is valid
  //    * - [X] Control has a custom error set
  //    * - [ ] onSubmit returned field errors
  //    */
  //   describe('Scenario 6', () => {
  //     it('should clear custom errors on controls', () => {
  //       expect.assertions(6);

  //       let ctrlName = 'foo';
  //       let customMessage = 'bar';
  //       let test = onSubmitForm();

  //       let ctrl = formationCtrl({
  //         name: ctrlName,
  //         [CUSTOM_ERROR_MESSAGE_KEY]: customMessage,
  //         [NG_MODEL_CTRL]: {
  //           $error: {
  //             [CUSTOM_ERROR_KEY]: true
  //           }
  //         }
  //       });

  //       test.pending(false);
  //       test.valid(true);
  //       test.form.$registerControl(ctrl);

  //       let promise = test.form.$submit().then(response => {
  //         expect(response).toBe('SUBMIT_COMPLETE');
  //         expect(ctrl[CUSTOM_ERROR_MESSAGE_KEY]).toBeFalsy();
  //         expect(ctrl[NG_MODEL_CTRL].$error[CUSTOM_ERROR_KEY]).toBe(false);
  //         expect(test.spies.disable.mock.calls.length).toBe(1);
  //         expect(test.spies.onSubmit.mock.calls.length).toBe(1);
  //         expect(test.spies.enable.mock.calls.length).toBe(1);
  //       });

  //       jest.runAllTimers();
  //       return promise;
  //     });
  //   });
  // });

  // describe('getControl', () => {
  //   it('should return the named control, if it exists', () => {
  //     let ctrlName = 'foo';
  //     let badName = 'bar';
  //     let form = createForm();

  //     let ctrl = formationCtrl({
  //       name: ctrlName
  //     });

  //     form.$onInit();
  //     form.$registerControl(ctrl);

  //     expect(form.getControl(badName)).toBeFalsy();
  //     expect(form.getControl(ctrlName)).toBe(ctrl);
  //   });
  // });

  // describe('disable', () => {
  //   it('should set the $disabled flag to "true"', () => {
  //     let form = createForm({
  //       $disabled: false
  //     });

  //     expect(form.$disabled).toBe(false);
  //     form.disable();
  //     expect(form.$disabled).toBe(true);
  //   });
  // });

  // describe('enable', () => {
  //   it('should set the $disabled flag to "false"', () => {
  //     let form = createForm({
  //       $disabled: true
  //     });

  //     expect(form.$disabled).toBe(true);
  //     form.enable();
  //     expect(form.$disabled).toBe(false);
  //   });
  // });
});
