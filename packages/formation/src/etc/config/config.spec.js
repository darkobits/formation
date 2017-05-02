import angular from 'angular';

import {
  module,
  get,
  directive,
  digest
} from '@darkobits/unity';

import Formation from '../../index';

import {
  FORM_COMPONENT_NAME,
  NG_MODEL_CTRL
} from '../../../src/etc/constants';

import {
  NG_FORM_CONTROLLER
} from '../../../src/components/Form/Form';

import {
  $registerComponent,
  FormationConfigurator
} from '../../../src/etc/config';


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


describe('Configurator', () => {
  describe('prior to the Angular bootstrapping', () => {
    it('should require an object as its argument', () => {
      expect(() => {
        FormationConfigurator({});
      }).not.toThrow();

      expect(() => {
        FormationConfigurator('foo');
      }).toThrow('FormationConfigurator expected options to be of type Object');
    });

    it('should require showErrorsOn to be a string or nil', () => {
      expect(() => {
        FormationConfigurator({
          showErrorsOn: 'foo'
        });
      }).not.toThrow();

      expect(() => {
        FormationConfigurator({
          showErrorsOn: []
        });
      }).toThrow('FormationConfigurator expected showErrorsOn to be of type String or Undefined');
    });

    it('should require prefix to be a string or nil', () => {
      expect(() => {
        FormationConfigurator({
          prefix: 'foo'
        });
      }).not.toThrow();

      expect(() => {
        FormationConfigurator({
          prefix: []
        });
      }).toThrow('FormationConfigurator expected prefix to be of type String or Undefined');
    });
  });

  describe('after Angular bootstrapping', () => {
    beforeEach(() => {
      module(Formation);
    });

    it('should throw an error', () => {
      expect(() => {
        FormationConfigurator();
      }).toThrow(`Formation must be configured prior to Angular's "run" phase.`);
    });
  });
});


describe('Decorators', () => {
  let T;

  const componentNames = ['foo', 'bar', 'baz'];

  beforeEach(() => {
    componentNames.forEach(componentName => $registerComponent(componentName, {}));
    module(Formation);
  });

  describe('Decorating ngForm', () => {
    describe('requiring a Formation form controller', () => {
      it('should require the Formation form controller', () => {
        const [ngFormDirective] = get('formDirective');
        expect(ngFormDirective.require).toEqual(expect.arrayContaining([`?^^${FORM_COMPONENT_NAME}`]));
      });
    });

    describe('registering with a Formation form', () => {
      beforeEach(() => {
        T = directive('fm', {
          template: `
            <fm></fm>
          `
        });
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
