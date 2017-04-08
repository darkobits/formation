// import {
//   REGISTER_NG_MODEL_CALLBACK
// } from '../../../src/etc/constants';

import {
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  RegisterControl,
  RegisterNgModel
} from '../../etc/interfaces';

import {
  NG_MESSAGES,
  FormationControl
} from './FormationControl';




function createControl (bindings, form = {}, ngModelCtrl = {}) {
  return Object.assign(new FormationControl(), {
    [FORM_CONTROLLER]: form,
    [NG_MODEL_CTRL]: ngModelCtrl
  }, bindings);
}


describe('FormationControl', () => {
  describe('ngModel registration', () => {
    it('should define an ngModel registration method', () => {
      let control = createControl();
      expect(typeof control[RegisterNgModel]).toBe('function');
    });

    it('should register with the form and assign ngModel to the correct key', () => {
      let spy = jest.fn();
      let ngModelCtrl = {};
      let control = createControl({}, {[RegisterControl]: spy});
      control[RegisterNgModel](ngModelCtrl);
      expect(control[NG_MODEL_CTRL]).toBe(ngModelCtrl);
      expect(spy.mock.calls[0]).toContain(control);
    });
  });

  describe('$getName', () => {
    it('should report its name when assigned a "name" binding', () => {
      let name = 'foo';
      let control = createControl({name});
      expect(control.$getName()).toBe(name);
    });

    it('should report its name when assigned a "for" binding', () => {
      let forStr = 'foo';
      let control = createControl({for: forStr});
      expect(control.$getName()).toBe(forStr);
    });
  });

  describe('$isDisabled', () => {
    it('should return true when its "$ngDisabled" binding is true', () => {
      let control = createControl({$ngDisabled: true});
      expect(control.$isDisabled()).toBe(true);
    });

    it('should return true when its "$disabled" binding is true', () => {
      let control = createControl({$disabled: true});
      expect(control.$isDisabled()).toBe(true);
    });

    it('should return true when its form controller is disabled', () => {
      let control = createControl({}, {$isDisabled: () => true});
      expect(control.$isDisabled()).toBe(true);
    });
  });

  describe('$onDestroy', () => {
    it('should unregister from its form controller if it has a model', () => {
      let spy = jest.fn();
      let control = createControl({}, {$unregisterControl: spy});
      control.$onDestroy();
      expect(spy.mock.calls[0]).toContain(control);
    });

    it('should not unregister from its form controller if it does not have a model', () => {
      let spy = jest.fn();
      let control = createControl({}, {$unregisterControl: spy}, null);
      control.$onDestroy();
      expect(spy.mock.calls.length).toBe(0);
    });
  });

  describe('$getControl', () => {
    it('should attempt to get the correct control from the form', () => {
      let name = 'foo';
      let spy = jest.fn(getName => getName === name);
      let control = createControl({name}, {getControl: spy});
      let result = control.$getControl();
      expect(result).toBe(true);
      expect(spy.mock.calls[0]).toContain(name);
    });
  });

  describe('$getCanonicalControlId', () => {
    it('should attempt to get the ID of its canonical control from the form', () => {
      let formName = 'Form';
      let controlName = 'foo';
      let $uid = '42';
      let spy = jest.fn(getName => getName === controlName ? {$uid} : false);
      let control = createControl({name: controlName}, {$name: formName, getControl: spy});
      let result = control.$getCanonicalControlId();
      expect(result).toBe(`${formName}-${$uid}`);
      expect(spy.mock.calls[0]).toContain(controlName);
    });
  });

  describe('getControlId', () => {
    it('should return its ID', () => {
      let $uid = '42';
      let formName = 'Form';
      let control = createControl({$uid}, {name: formName});
      expect(control.getControlId()).toBe(`${formName}-${$uid}`);
    });
  });

  describe('enable', () => {
    it('should set its "$disabled" flag to "false"', () => {
      let control = createControl({$disabled: true});
      control.enable();
      expect(control.$disabled).toBe(false);
    });
  });

  describe('disable', () => {
    it('should set its "$disabled" flag to "true"', () => {
      let control = createControl({$disabled: false});
      control.disable();
      expect(control.$disabled).toBe(true);
    });
  });

  // describe('getErrors', () => {
  //   it('should attempt to get errors from its form controller', () => {
  //     let spy = jest.fn();
  //     let controlName = 'foo';
  //     let control = createControl({name: controlName}, {getErrorsForControl: spy});
  //     control.getControlErrors();
  //     expect(spy.mock.calls[0]).toContain(controlName);
  //   });
  // });

  // describe('getErrorMessages', () => {
  //   it('should attempt to get error message from its form controller', () => {
  //     let expected = true;
  //     let spy = jest.fn(() => ({[NG_MESSAGES]: expected}));
  //     let controlName = 'foo';
  //     let control = createControl({name: controlName}, {getControl: spy});
  //     let result = control.getErrorMessages();

  //     expect(result).toBe(expected);
  //     expect(spy.mock.calls[0]).toContain(controlName);
  //   });
  // });

  // describe('getCustomErrorMessage', () => {
  //   it('should attempt to get its custom error message from its form controller', () => {
  //     let message = 'foo';
  //     let spy = jest.fn(() => message);
  //     let controlName = 'foo';
  //     let control = createControl({name: controlName}, {$getCustomErrorMessageForControl: spy});
  //     let result = control.getCustomErrorMessage();

  //     expect(result).toBe(message);
  //     expect(spy.mock.calls[0]).toContain(controlName);
  //   });
  // });

  // describe('getModelValue / setModelValue / $ngModelGetterSetter', () => {
  //   let form = {
  //     modelValues: {},
  //     $getModelValue (name) {
  //       return form.modelValues[name];
  //     },
  //     $setModelValue (name, value) {
  //       form.modelValues[name] = value;
  //     }
  //   };

  //   describe('when called with no parameters', () => {
  //     it('should return the model value from the form', () => {
  //       let controlName = 'foo';
  //       let modelValue = 42;
  //       let control = createControl({name: controlName}, form);
  //       form.$setModelValue(controlName, modelValue);
  //       expect(control.$ngModelGetterSetter()).toBe(modelValue);
  //     });
  //   });

  //   describe('when called with parameters', () => {
  //     let controlName = 'bar';
  //     let control = createControl({name: controlName}, form);

  //     it('should set the model value with the form', () => {
  //       let modelValue = 17;
  //       control.$ngModelGetterSetter(modelValue);
  //       expect(form.$getModelValue(controlName)).toBe(modelValue);
  //     });

  //     it('should deep clone non-primitive values', () => {
  //       let deepValue = {foo: 'bar'};
  //       let modelValue = {deep: deepValue};
  //       control.$ngModelGetterSetter(modelValue);

  //       expect(form.$getModelValue(controlName)).toEqual(modelValue);
  //       expect(form.$getModelValue(controlName)).not.toBe(modelValue);

  //       expect(form.$getModelValue(controlName).deep).toEqual(deepValue);
  //       expect(form.$getModelValue(controlName).deep).not.toBe(deepValue);
  //     });
  //   });
  // });
});
