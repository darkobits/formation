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
    it('should implement the Configure interface', () => {
      expect(typeof T.fm[Configure]).toEqual('function');
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





  // describe('$onInit', () => {
  //   describe('setting the "$debugging" flag', () => {
  //     describe('when the "debug" attribute is present', () => {
  //       it('should set the "$debugging" flag to "true"', () => {
  //         let form = createForm({}, {
  //           $attrs: {
  //             debug: true
  //           }
  //         });

  //         form.$onInit();
  //         expect(form.$debugging).toBe(true);
  //       });
  //     });

  //     describe('when the "debug" attribute is absent', () => {
  //       it('should not set the "$debugging" flag to "true"', () => {
  //         let form = createForm();
  //         expect(form.$debugging).toBeFalsy();
  //       });
  //     });
  //   });

  //   describe('assigning "$name" to parent scope', () => {
  //     describe('when provided a non-empty string', () => {
  //       let formName = 'vm.myForm';

  //       let assignSpy = jest.fn();

  //       let parseSpy = jest.fn().mockImplementation(() => {
  //         return {
  //           assign: assignSpy
  //         };
  //       });

  //       let form = createForm({
  //         $name: formName
  //       }, {
  //         $parse: parseSpy
  //       });

  //       form.$onInit();

  //       it('should assign the form controller to its parent scope', () => {
  //         expect(parseSpy.mock.calls[0]).toEqual(expect.arrayContaining([formName]));
  //         expect(assignSpy.mock.calls[0]).toEqual(expect.arrayContaining([form]));
  //       });
  //     });

  //     describe('when not provided a falsy value', () => {
  //       let form = createForm({});
  //       form.$onInit();

  //       it('should assign an auto-generated name', () => {
  //         expect(form.$name).toMatch(new RegExp(`Form-\\d*`));
  //       });
  //     });
  //   });

  //   describe('parsing "$showErrorsOn"', () => {
  //     describe('when provided a valid string', () => {
  //       let form = createForm({
  //         $showErrorsOn: 'touched, submitted'
  //       });

  //       form.$onInit();

  //       it('should parse the string into an array of flags', () => {
  //         expect(form.showErrorsOn).toEqual(['$touched', '$submitted']);
  //       });
  //     });

  //     describe('when provided a falsy value', () => {
  //       let form = createForm();

  //       form.$onInit();

  //       it('should no-op', () => {
  //         expect(form.showErrorsOn).toBeFalsy();
  //       });
  //     });

  //     describe('when provided an empty string', () => {
  //       let form = createForm({
  //         $showErrorsOn: ''
  //       });

  //       form.$onInit();

  //       it('should no-op', () => {
  //         expect(form.showErrorsOn).toBeFalsy();
  //       });
  //     });
  //   });
  // });

  // describe('isDisabled', () => {
  //   it('should return true when "$disabled" is truthy', () => {
  //     let form = createForm({$disabled: true});
  //     expect(form.isDisabled()).toBe(true);
  //   });

  //   it('should return true when "$ngDisabled" is truthy', () => {
  //     let form = createForm({$ngDisabled: true});
  //     expect(form.isDisabled()).toBe(true);
  //   });

  //   it('should return a falsy value when neither "$disabled" or "$ngDisabled" are true', () => {
  //     let form = createForm();
  //     expect(form.isDisabled()).toBeFalsy();
  //   });
  // });

  // describe('$getModelValue / $setModelValue', () => {
  //   it('should get/set the model value for the named control', () => {
  //     let ctrlName = 'foo';
  //     let value = 'bar';
  //     let form = createForm();
  //     form.$setModelValue(ctrlName, value);
  //     expect(form.$getModelValue(ctrlName)).toBe(value);
  //   });
  // });

  // describe('$registerControl', () => {
  //   let ctrlName = 'foo';

  //   describe('assigning a uid', () => {
  //     it('should assign a uid to the control', () => {
  //       let form = createForm({});

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(ctrl.$uid).toMatch(new RegExp(`${ctrlName}-\\d*`));
  //     });
  //   });

  //   describe('adding controls to the registry', () => {
  //     it('should add the control to the registry', () => {
  //       let form = createForm({});

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(form.getControl(ctrlName)).toBe(ctrl);
  //     });
  //   });

  //   describe('applying parsers', () => {
  //     it('should apply parsers to the control', () => {
  //       let parsers = [
  //         () => {}
  //       ];

  //       let form = createForm({
  //         $controlConfiguration: {
  //           [ctrlName]: {
  //             parsers
  //           }
  //         }
  //       });

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(ctrl[NG_MODEL_CTRL].$parsers.length).toEqual(1);
  //     });
  //   });

  //   describe('applying formatters', () => {
  //     it('should apply formatters to the control', () => {
  //       let formatters = [
  //         () => {}
  //       ];

  //       let form = createForm({
  //         $controlConfiguration: {
  //           [ctrlName]: {
  //             formatters
  //           }
  //         }
  //       });

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(ctrl[NG_MODEL_CTRL].$formatters.length).toEqual(1);
  //     });
  //   });

  //   describe('applying validators', () => {
  //     it('should apply validators to the control', () => {
  //       let validators = {
  //         foo: () => {}
  //       };

  //       let form = createForm({
  //         $controlConfiguration: {
  //           [ctrlName]: {
  //             validators
  //           }
  //         }
  //       });

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(Object.keys(ctrl[NG_MODEL_CTRL].$validators))
  //         .toEqual(expect.arrayContaining(Object.keys(validators)));
  //     });
  //   });

  //   describe('applying async validators', () => {
  //     it('should apply async validators to the control', () => {
  //       let asyncValidators = {
  //         foo: () => {}
  //       };

  //       let form = createForm({
  //         $controlConfiguration: {
  //           [ctrlName]: {
  //             asyncValidators
  //           }
  //         }
  //       });

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(Object.keys(ctrl[NG_MODEL_CTRL].$asyncValidators))
  //         .toEqual(expect.arrayContaining(Object.keys(asyncValidators)));
  //     });
  //   });

  //   describe('applying error messages', () => {
  //     it('should apply ngMessages to the control', () => {
  //       let errors = [
  //         ['foo', 'bar']
  //       ];

  //       let form = createForm({
  //         $controlConfiguration: {
  //           [ctrlName]: {
  //             errors
  //           }
  //         }
  //       });

  //       let ctrl = formationCtrl({
  //         name: ctrlName
  //       });

  //       form.$onInit();

  //       form.$registerControl(ctrl);

  //       expect(ctrl[NG_MESSAGES]).toEqual(expect.arrayContaining(errors));
  //     });
  //   });
  // });

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

  // describe('$getCustomErrorMessageForControl', () => {
  //   let ctrlName = 'foo';
  //   let message = 'bar';

  //   let form = createForm();

  //   let ctrl = formationCtrl({
  //     name: ctrlName,
  //     [NG_MODEL_CTRL]: {
  //       $name: ctrlName
  //     },
  //     [CUSTOM_ERROR_MESSAGE_KEY]: message
  //   });

  //   form.$onInit();
  //   form.$registerControl(ctrl);

  //   it('should retrun the custom error message for the named control', () => {
  //     expect(form.$getCustomErrorMessageForControl(ctrlName)).toBe(message);
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

  // describe('getModelValues / setModelValues', () => {
  //   let deepValue = {
  //     foo: 'bar'
  //   };

  //   let modelValues = {
  //     deep: deepValue
  //   };

  //   let form = createForm();
  //   form.$onInit();
  //   form.setModelValues(modelValues);

  //   it('should set and get model values', () => {
  //     expect(form.getModelValues()).toEqual(modelValues);
  //   });

  //   it('should deep clone non-primitive values', () => {
  //     expect(form.getModelValues()).not.toBe(modelValues);
  //     expect(form.getModelValues().deep).toEqual(deepValue);
  //     expect(form.getModelValues().deep).not.toBe(deepValue);
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

  // describe('reset', () => {
  //   it('should validate all controls and set them to pristine and untouched', () => {
  //     let formPristineSpy = jest.fn();
  //     let pristineSpy = jest.fn();
  //     let untouchedSpy = jest.fn();
  //     let validateSpy = jest.fn();

  //     let ctrl = formationCtrl({
  //       name: 'foo',
  //       [NG_MODEL_CTRL]: {
  //         $setPristine: pristineSpy,
  //         $setUntouched: untouchedSpy,
  //         $validate: validateSpy
  //       }
  //     });

  //     let form = createForm({
  //       [NG_FORM_CONTROLLER]: {
  //         $setPristine: formPristineSpy
  //       }
  //     });

  //     form.$onInit();
  //     form.$registerControl(ctrl);
  //     form.reset();

  //     expect(formPristineSpy.mock.calls.length).toBe(1);
  //     expect(pristineSpy.mock.calls.length).toBe(1);
  //     expect(untouchedSpy.mock.calls.length).toBe(1);
  //     expect(validateSpy.mock.calls.length).toBeGreaterThan(1);
  //   });

  //   it('should apply model values, if provided', () => {
  //     let modelValues = {
  //       foo: 'bar'
  //     };

  //     let form = createForm({
  //       [NG_FORM_CONTROLLER]: {
  //         $setPristine: () => {}
  //       }
  //     });
  //     form.$onInit();
  //     form.reset(modelValues);

  //     expect(form.getModelValues()).toEqual(modelValues);
  //   });
  // });
});
