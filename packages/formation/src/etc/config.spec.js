import {
  module,
  get,
  directive
} from '@darkobits/unity';

import Formation from '../index';

import {
  FORM_COMPONENT_NAME,
  NG_MODEL_CTRL
} from '../../src/etc/constants';

import {
  NG_FORM_CONTROLLER
} from '../../src/components/Form/Form';

import {
  $registerComponent
} from '../../src/etc/config';


/**
 * Duck typing to determine if a value is an instance of ngForm.
 */
function assertIsNgFormController (value) {
  expect(Object.keys(value)).toEqual(expect.arrayContaining([
    '$$parentForm', '$submitted'
  ]));
}


/**
 * Duck typing to determine if a value is an instance of ngModel.
 */
function assertIsNgModelController (value) {
  expect(Object.keys(value)).toEqual(expect.arrayContaining([
    '$parsers', '$formatters', '$validators', '$asyncValidators', '$options'
  ]));
}


describe('Formation Configuration', () => {
  let T;

  const componentNames = ['foo', 'bar', 'baz'];

  beforeEach(() => {
    componentNames.forEach(componentName => $registerComponent(componentName, {}));
    module(Formation);
  });

  describe('Decorating ngForm', () => {
    it('should require the Formation form controller', () => {
      const [ngFormDirective] = get('formDirective');
      expect(ngFormDirective.require).toEqual(expect.arrayContaining([`?^^${FORM_COMPONENT_NAME}`]));
    });

    describe('registering with a Formation form', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm></fm>
          `
        });

        get('$rootScope').$digest();
        get('$rootScope').$digest();
        get('$rootScope').$digest();
        get('$rootScope').$digest();
      });

      it('should register with the Formation form, if present', () => {
        const ngFormController = T.fm[NG_FORM_CONTROLLER];
        assertIsNgFormController(ngFormController);
      });
    });
  });

  describe('Decorating ngModel', () => {
    it('should require registered Formation controls', () => {
      const [ngModelDirective] = get('ngModelDirective');
      const registeredComponents = componentNames.map(componentName => `?^^${componentName}`);

      expect(ngModelDirective.require).toEqual(expect.arrayContaining(registeredComponents));
    });

    it('should require Formation forms', () => {
      const [ngModelDirective] = get('ngModelDirective');
      expect(ngModelDirective.require).toEqual(expect.arrayContaining(['?^^fm']));
    });

    describe('registering with a Formation form', () => {
      const controlName = 'foo';
      const value = 'bar';

      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm debug>
              <input name="${controlName}"
                type="text"
                ng-model="${controlName}"
            </fm>
          `,
          scope: {
            [controlName]: value
          }
        });
      });

      it('should register with the Formation form, if present', () => {
        const control = T.fm.getControl(controlName);

        assertIsNgModelController(control[NG_MODEL_CTRL]);
        expect(T.fm.getModelValues()).toEqual(expect.objectContaining({
          [controlName]: value
        }));
      });
    });

    describe('registering with a Formation control', () => {
      const controlName = 'foo';

      beforeEach(() => {
        T = directive('fmInput', {
          template: `
            <fm-input name="${controlName}"></fm-input>`,
          wrap: `
            <fm></fm>
          `
        });
      });

      it('should register with the Formation form, if present', () => {
        const control = T.fmInput;
        assertIsNgModelController(control[NG_MODEL_CTRL]);
      });
    });
  });
});
