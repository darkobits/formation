import * as Validators from '../../src/etc/validators';

import {
  NG_MODEL_CTRL
} from '../../src/components/FormationControl';


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
    let min = Validators.min(10);

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
    let minLength = Validators.minLength(3);

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
    let max = Validators.max(10);

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
    let maxLength = Validators.maxLength(3);

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
    let pattern = Validators.pattern(/\d{5}/g);

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
    const mockControl = name => ({
      [NG_MODEL_CTRL]: {
        $name: name,
        $validators: {}
      },
      $getName () {
        return name;
      }
    });

    let passwordControl = mockControl('password');
    let passwordMatchControl = mockControl('passwordMatch');
    let badControl = {
      $getName: () => 'badControl'
    };


    const mockForm = {
      $debug: jest.fn(),
      getControl (name) {
        const controls = {
          password: passwordControl,
          passwordMatch: passwordMatchControl,
          badControl: badControl
        };

        return controls[name];
      }
    };

    it('should return a null validator when trying to match itself', () => {
      let nullValidator = (Validators.match('password')(mockForm)).bind(passwordControl[NG_MODEL_CTRL]);
      expect(nullValidator('foo')).toEqual(true);
      expect(mockForm.$debug.mock.calls[0][0]).toMatch(/is trying to match itself/g);
    });

    it('should return false when the dependent control has no model', () => {
      let nullValidator = (Validators.match('password')(mockForm)).bind(badControl[NG_MODEL_CTRL]);
      expect(nullValidator('bleh')).toEqual(false);
      expect(mockForm.$debug.mock.calls[1][0]).toMatch(/Both controls must use ngModel./g);
    });

    it('should return false when the independent control does not have a model', () => {
      let nullValidator = (Validators.match('badControl')(mockForm)).bind(passwordMatchControl[NG_MODEL_CTRL]);
      expect(nullValidator('foo')).toBe(false);
      expect(mockForm.$debug.mock.calls[2][0]).toMatch(/Both controls must use ngModel/g);
    });

    it('should return true when provided a model value that matches its complement', () => {
      let matchPassword = (Validators.match('password')(mockForm)).bind(passwordMatchControl[NG_MODEL_CTRL]);
      passwordControl[NG_MODEL_CTRL].$$rawModelValue = 'foo';
      expect(matchPassword('foo')).toBe(true);
    });

    it('should return false when provided a model value that does not match its complement', () => {
      let matchPassword = (Validators.match('password')(mockForm)).bind(passwordMatchControl[NG_MODEL_CTRL]);
      passwordControl[NG_MODEL_CTRL].$$rawModelValue = 'foo';
      expect(matchPassword('bar')).toBe(false);
    });
  });
});
