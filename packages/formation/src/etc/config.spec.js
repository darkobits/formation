import {
  module,
  get,
  directive
} from '@darkobits/unity';

import {
  FORM_COMPONENT_NAME,
  NG_MODEL_CTRL
} from 'etc/constants';

import {NG_FORM_CONTROLLER} from 'components/Form';

import {
  $registerComponent,
  configure
} from 'etc/config';

import Formation from 'index';


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


describe('#configure', () => {
  describe('prior to the Angular bootstrapping', () => {
    it('should require an object as its argument', () => {
      expect(() => {
        configure({});
      }).not.toThrow();

      expect(() => {
        configure('foo');
      }).toThrow('configure expected options to be of type Object');
    });

    it('should require showErrorsOn to be a string or nil', () => {
      expect(() => {
        configure({
          showErrorsOn: 'foo'
        });
      }).not.toThrow();

      expect(() => {
        configure({
          showErrorsOn: []
        });
      }).toThrow('configure expected showErrorsOn to be of type String or Undefined');
    });

    it('should require prefix to be a string or nil', () => {
      expect(() => {
        configure({
          prefix: 'foo'
        });
      }).not.toThrow();

      expect(() => {
        configure({
          prefix: []
        });
      }).toThrow('configure expected prefix to be of type String or Undefined');
    });
  });

  describe('after Angular bootstrapping', () => {
    beforeEach(() => {
      module(Formation);
    });

    it('should throw an error', () => {
      expect(() => {
        configure();
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
