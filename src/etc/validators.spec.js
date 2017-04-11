import $scope from '../../tests/__mocks__/$scope.mock';

import * as Validators from './validators';

import {
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from './constants';


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
    const mockControl = (name, form) => ({
      name,
      [FORM_CONTROLLER]: form,
      [NG_MODEL_CTRL]: {
        $name: name,
        $validators: {},
        $setValidity () {

        }
      },
      $getName () {
        return name;
      }
    });

    const mockForm = () => ({
      controls: {},
      $debug: jest.fn(),
      $getScope () {
        return $scope;
      },
      addControl (control) {
        this.controls[control.name] = control;
      },
      getControl (name) {
        return this.controls[name];
      }
    });

    const form = mockForm();

    const passwordControl = mockControl('password', form);

    const passwordMatchControl = mockControl('passwordMatch', form);

    const badControl = {
      [FORM_CONTROLLER]: form,
      name: 'badControl',
      $getName: () => 'badControl'
    };

    form.addControl(passwordControl);
    form.addControl(passwordMatchControl);
    form.addControl(badControl);

    it('should return a null validator when trying to match itself', () => {
      const nullValidator = Validators.match('password').configure(passwordControl);
      expect(nullValidator('foo')).toEqual(true);
      expect(form.$debug.mock.calls[0][0]).toMatch(/is trying to match itself/g);
    });

    it('should return false when the dependent control has no model', () => {
      const nullValidator = Validators.match('password').configure(badControl);
      expect(nullValidator('bleh')).toEqual(false);
      expect(form.$debug.mock.calls[1][0]).toMatch(/Both controls must use ngModel./g);
    });

    it('should return false when the independent control does not have a model', () => {
      const nullValidator = Validators.match('badControl').configure(passwordMatchControl);
      expect(nullValidator('foo')).toBe(false);
      expect(form.$debug.mock.calls[2][0]).toMatch(/Both controls must use ngModel/g);
    });

    it('should return true when provided a view value that matches its complement', () => {
      const matchPassword = Validators.match('password').configure(passwordMatchControl);
      passwordControl[NG_MODEL_CTRL].$viewValue = 'foo';
      passwordMatchControl[NG_MODEL_CTRL].$viewValue = 'foo';
      expect(matchPassword('foo', 'foo')).toBe(true);
    });

    it('should return false when provided a view value that does not match its complement', () => {
      const matchPassword = Validators.match('password').configure(passwordMatchControl);
      passwordControl[NG_MODEL_CTRL].$viewValue = 'foo';
      expect(matchPassword('bar', 'bar')).toBe(false);
    });
  });
});
