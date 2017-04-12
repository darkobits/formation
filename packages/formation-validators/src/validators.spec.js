import {
  last
} from 'ramda';

import Formation, {
  $constants
} from '@darkobits/formation';

import {
  compile,
  module,
  directive
} from '@darkobits/unity';

import * as Validators from './validators';

const {
  NG_MODEL_CTRL
} = $constants;


describe('Validators', () => {
  describe('required', () => {
    it('should return true when provided a truthy value', () => {
      expect(Validators.required(42)).toBe(true);
    });

    it('should return true when provided a non-empty string', () => {
      expect(Validators.required('foo')).toBe(true);
    });

    it('should return false when provided null undefined', () => {
      expect(Validators.required(null)).toBe(false);
      expect(Validators.required(undefined)).toBe(false);
    });

    it('should return false when provided an empty string', () => {
      expect(Validators.required('')).toBe(false);
    });
  });

  describe('min', () => {
    const min = Validators.min(10);

    it('should return true when provided a number greater than the init value', () => {
      expect(min(12)).toBe(true);
    });

    it('should return true when provided a number equal to the init value', () => {
      expect(min(10)).toBe(true);
    });

    it('should return false when provided a number less than the init value', () => {
      expect(min(8)).toBe(false);
    });
  });

  describe('minLength', () => {
    const minLength = Validators.minLength(3);

    it('should return true when provided a string with length greater than the init value', () => {
      expect(minLength('applesauce')).toBe(true);
    });

    it('should return true when provided a string with length equal to the init value', () => {
      expect(minLength('foo')).toBe(true);
    });

    it('should return false when provided a string with length less than the init value', () => {
      expect(minLength('a')).toBe(false);
    });
  });

  describe('max', () => {
    const max = Validators.max(10);

    it('should return true when provided a number less than the init value', () => {
      expect(max(8)).toBe(true);
    });

    it('should return true when provided a number equal to the init value', () => {
      expect(max(10)).toBe(true);
    });

    it('should return false when provided a number greater than the init value', () => {
      expect(max(12)).toBe(false);
    });
  });

  describe('maxLength', () => {
    const maxLength = Validators.maxLength(3);

    it('should return true when provided a string with length less than the init value', () => {
      expect(maxLength('a')).toBe(true);
    });

    it('should return true when provided a string with length equal to the init value', () => {
      expect(maxLength('foo')).toBe(true);
    });

    it('should return false when provided a string with length greater than the init value', () => {
      expect(maxLength('applesauce')).toBe(false);
    });
  });

  describe('email', () => {
    it('should return true when provided a valid e-mail address', () => {
      expect(Validators.email('frodo@shirewire.com')).toBe(true);
    });

    it('should return false when provided an invalid email address', () => {
      expect(Validators.email('foo')).toBe(false);
      expect(Validators.email('foo@')).toBe(false);
      expect(Validators.email('foo@bar')).toBe(false);
      expect(Validators.email('@bar')).toBe(false);
      expect(Validators.email('bar.com')).toBe(false);
      expect(Validators.email(42)).toBe(false);
    });
  });

  describe('pattern', () => {
    const pattern = Validators.pattern(/\d{5}/g);

    it('should return true when provided a view value that matches the init pattern', () => {
      expect(pattern(null, '23443')).toBe(true);
      expect(pattern(null, 55426)).toBe(true);
    });

    it('should return false when provided a view value that does not match the init pattern', () => {
      expect(pattern(null, 'foo')).toBe(false);
      expect(pattern(null, 42)).toBe(false);
    });
  });

  describe('match', () => {
    let T;
    let Form;

    beforeEach(() => {
      module(Formation);
    });

    describe('trying to match itself', () => {
      beforeEach(() => {
        const wrap = compile({
          template: `
          <fm controls="controls">
            <fm-input name="password"></fm-input>
            <transclude></transclude>
          </fm>
        `,
          scope: {
            controls: {
              passwordMatch: {
                validators: {
                  match: Validators.match('passwordMatch')
                }
              }
            }
          }
        });

        Form = wrap.controller('fm');
        jest.spyOn(Form, '$debug');

        T = directive('fmInput', {
          wrap,
          template: '<fm-input name="passwordMatch"></fm-input>'
        });
      });

      it('should return a null validator when trying to match itself', () => {
        T.fmInput[NG_MODEL_CTRL].$validate();
        expect(last(Form.$debug.mock.calls)[0]).toMatch(/is trying to match itself/g);
        expect(T.fmInput[NG_MODEL_CTRL].$validators.match('foo')).toEqual(true);
      });
    });

    describe('matching', () => {
      beforeEach(() => {
        const wrap = compile({
          template: `
          <fm controls="controls">
            <fm-input name="password"></fm-input>
            <transclude></transclude>
          </fm>
        `,
          scope: {
            controls: {
              passwordMatch: {
                validators: {
                  match: Validators.match('password')
                }
              }
            }
          }
        });

        Form = wrap.controller('fm');
        jest.spyOn(Form, '$debug');

        T = directive('fmInput', {
          wrap,
          template: '<fm-input name="passwordMatch"></fm-input>'
        });
      });

      it('should return true when provided a view value that matches its complement', () => {
        Form.getControl('password')[NG_MODEL_CTRL].$setViewValue('foo');

        Form.getControl('passwordMatch')[NG_MODEL_CTRL].$setViewValue('foo');
        Form.getControl('passwordMatch')[NG_MODEL_CTRL].$validate();

        expect(Form.getControl('passwordMatch').getErrors()).toEqual(false);
      });


      it('should return true when provided a view value that matches its complement', () => {
        Form.getControl('password')[NG_MODEL_CTRL].$setViewValue('foo');

        Form.getControl('passwordMatch')[NG_MODEL_CTRL].$setViewValue('bar');
        Form.getControl('passwordMatch')[NG_MODEL_CTRL].$validate();

        expect(Form.getControl('passwordMatch').getErrors()).toEqual(expect.objectContaining({
          match: true
        }));
      });
    });
  });
});
