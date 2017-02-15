import * as Utils from '../../src/etc/utils';


describe('Utils', () => {
  describe('capitalize', () => {
    it('should capitalize a string', () => {
      let input = 'foo';

      expect(Utils.capitalize(input)).toBe('Foo');
    });
  });

  describe('lowercase', () => {
    it('should convert the first character of a string to lowercase', () => {
      let input = 'Foo';

      expect(Utils.lowercase(input)).toBe('foo');
    });
  });

  describe('mergeDeep', () => {
    it('should overwrite literals', () => {
      let objA = {foo: 'bar'};
      let objB = {foo: 'baz'};

      expect(Utils.mergeDeep(objA, objB)).toEqual({
        foo: 'baz'
      });
    });

    it('should append arrays', () => {
      let objA = {
        foo: [1, 2, 3]
      };

      let objB = {
        foo: [4, 5, 6]
      };

      expect(Utils.mergeDeep(objA, objB)).toEqual({
        foo: [1, 2, 3, 4, 5, 6]
      });
    });

    it('should merge objects', () => {
      let objA = {
        foo: {
          bar: {
            baz: 1
          }
        }
      };

      let objB = {
        foo: {
          bar: {
            bleep: 2
          }
        }
      };

      expect(Utils.mergeDeep(objA, objB)).toEqual({
        foo: {
          bar: {
            baz: 1,
            bleep: 2
          }
        }
      });
    });
  });
});
