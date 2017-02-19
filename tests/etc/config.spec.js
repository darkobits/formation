import R from 'ramda';
import NgUnit from '../helpers';
import '../../src/index';

import {
  FORM_COMPONENT_NAME
} from '../../src/etc/constants';

import {
  NG_FORM_CONTROLLER
} from '../../src/components/Form/Form';

import {
  NG_MODEL_CTRL
} from '../../src/components/FormationControl';


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

  beforeEach(() => {
    T = new NgUnit();
    T.prepareModule('Formation');
  });

  describe('Decorating ngForm', () => {
    it('should require the Formation form controller', () => {
      let [ngFormDirective] = T.get('formDirective');
      expect(ngFormDirective.require).toEqual(expect.arrayContaining([`^?${FORM_COMPONENT_NAME}`]));
    });

    describe('registering with a Formation form', () => {
      beforeEach(() => {
        T.prepareDirective('fm', {
          template: `
            <fm></fm>
          `
        });
      });

      it('should register with the Formation form, if present', () => {
        let ngFormController = T.spec.fm[NG_FORM_CONTROLLER];
        assertIsNgFormController(ngFormController);
      });
    });
  });

  describe('Decorating ngModel', () => {
    let componentName = 'foo';

    beforeEach(() => {
      T.prepareService('Formation');
      T.prepareProvider('FormationProvider');
      T.spec.Formation.registerControl(componentName, {});
    });

    it('should require registered Formation controls', () => {
      let [ngModelDirective] = T.get('ngModelDirective');

      let registeredComponents = R.map(
        component => `^^?${component}`,
        T.spec.FormationProvider.$getRegisteredComponents()
      );

      expect(ngModelDirective.require).toEqual(expect.arrayContaining(registeredComponents));
    });

    describe('registering with a Formation form', () => {
      let controlName = 'foo';
      let value = 'bar';

      beforeEach(() => {
        T.prepareDirective('fm', {
          template: `
            <fm>
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
        let control = T.spec.fm.getControl(controlName);

        assertIsNgModelController(control[NG_MODEL_CTRL]);
        expect(T.spec.fm.getModelValues()).toEqual(expect.objectContaining({
          [controlName]: value
        }));
      });
    });

    describe('registering with a Formation control', () => {
      let controlName = 'foo';
      // let value = 'bar';

      beforeEach(() => {
        T.prepareDirective('fmInput', {
          template: `
            <fm-input name="${controlName}"></fm-input>`,
          wrap: `
            <fm></fm>
          `
        });
      });

      it('should register with the Formation form, if present', () => {
        let control = T.spec.fmInput;
        assertIsNgModelController(control[NG_MODEL_CTRL]);
      });
    });
  });
});
