import R from 'ramda';
import * as Utils from '../../src/etc/utils';


describe('Utils', () => {
  describe('capitalizeFirst', () => {
    it('should capitalize a string', () => {
      const input = 'foo';

      expect(Utils.capitalizeFirst(input)).toBe('Foo');
    });
  });

  describe('lowercaseFirst', () => {
    it('should convert the first character of a string to lowercase', () => {
      const input = 'Foo';

      expect(Utils.lowercaseFirst(input)).toBe('foo');
    });
  });

  describe('throwError', () => {
    it('should throw an error with the provided message', () => {
      const message = 'foo';
      expect(() => Utils.throwError(message)).toThrow(message);
    });
  });

  describe('parseFlags', () => {
    it('should convert a comma-delimited string into an array', () => {
      const input = 'foo,bar,baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(Utils.parseFlags(input)).toEqual(expected);
    });

    it('should convert a space-delimited string into an array', () => {
      const input = 'foo bar baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(Utils.parseFlags(input)).toEqual(expected);
    });

    it('should convert a comma and space-delimited string into an array', () => {
      const input = 'foo, bar, baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(Utils.parseFlags(input)).toEqual(expected);
    });
  });

  describe('onReady', () => {
    // Note: Improve these tests when Jest's timers API sucks less.

    it('should resolve when the spied value becomes truthy', done => {
      expect.assertions(1);

      const obj = {
        foo: false
      };

      Utils.onReady(obj, 'foo').then(() => {
        expect(true).toBe(true);
        done();
      });

      setTimeout(() => {
        obj.foo = true;
      }, 1);
    });
  });

  describe('assignToScope', () => {
    const $scope = {};
    const expression = 'vm.foo';
    const value = 'foo';
    const assignSpy = jest.fn();

    const $parse = jest.fn().mockImplementation(() => ({
      assign: assignSpy
    }));

    it('should assign the provided value to the scope', () => {
      Utils.assignToScope($parse, {}, value, expression);

      expect(assignSpy.mock.calls[0]).toEqual([$scope, value]);
      expect($parse.mock.calls[0][0]).toEqual(expression);
    });
  });

  describe('toPairsWith', () => {
    describe('when passed 2 arguments', () => {
      it('should generate keys using the provided function', () => {
        const collection = [
          {name: 'foo'},
          {name: 'bar'},
          {name: 'baz'}
        ];

        const keyFn = i => i.name;

        const expected = [
          [collection[0].name, collection[0]],
          [collection[1].name, collection[1]],
          [collection[2].name, collection[2]]
        ];

        expect(Utils.toPairsWith(keyFn, collection)).toEqual(expected);
      });
    });

    describe('when passed 3 arguments', () => {
      it('should generate keys and values using the provided functions', () => {
        const collection = [
          {name: 'foo', age: 1},
          {name: 'bar', age: 2},
          {name: 'baz', age: 3}
        ];

        const keyFn = i => i.name;
        const valueFn = i => i.age;

        const expected = [
          [collection[0].name, collection[0].age],
          [collection[1].name, collection[1].age],
          [collection[2].name, collection[2].age]
        ];

        expect(Utils.toPairsWith(keyFn, valueFn, collection)).toEqual(expected);
      });
    });

    describe('when passed a bad key generation function', () => {
      it('should throw an error', () => {
        expect(() => Utils.toPairsWith(false, [])).toThrow('to be of type "Function"');
      });
    });

    describe('when passed a bad value generation function', () => {
      it('should throw an error', () => {
        expect(() => Utils.toPairsWith(i => i, false, [])).toThrow('to be of type "Function"');
      });
    });

    describe('when passed a bad collection', () => {
      it('should throw an error', () => {
        expect(() => Utils.toPairsWith(i => i, i => i, 'foo')).toThrow('to be of type "Array"');
      });
    });
  });

  describe('mergeEntries', () => {
    it('should match source entries to destination entries and return triplets', () => {
      const dest = [
        [1, 'foo'],
        [2, 'bar'],
        [3, 'baz']
      ];

      const src = [
        [1, 'qux']
      ];

      const expected = [
        [1, 'foo', 'qux'],
        [2, 'bar', undefined],
        [3, 'baz', undefined]
      ];

      expect(Utils.mergeEntries(dest, src)).toEqual(expected);
    });

    it('should duplicate source entries to matching destination entries', () => {
      const dest = [
        [1, 'foo'],
        [1, 'bar'],
        [2, 'baz']
      ];

      const src = [
        [1, 'qux']
      ];

      const expected = [
        [1, 'foo', 'qux'],
        [1, 'bar', 'qux'],
        [2, 'baz', undefined]
      ];

      expect(Utils.mergeEntries(dest, src)).toEqual(expected);
    });

    describe('error-handling', () => {
      it('should throw an error when passed non-arrays', () => {
        expect(() => Utils.mergeEntries('foo', [])).toThrow('first argument');
      });

      it('should throw an error when passed non-arrays', () => {
        expect(() => Utils.mergeEntries([], 'foo')).toThrow('second argument');
      });

      it('should throw an error when arrays contain non-entries', () => {
        expect(() => Utils.mergeEntries([1], [[1, 'foo']])).toThrow('Expected [key, value] entry');
        expect(() => Utils.mergeEntries([[1, 'foo']], [1])).toThrow('Expected [key, value] entry');
      });
    });
  });

  describe('invoke', () => {
    it('should invoke the named method on the provided object with provided arguments', () => {
      // We can't use jest.fn() here, because they fail R.is(Function).

      let wasInvoked = false;
      let invokedWith;

      const obj = {
        getName (...args) {
          wasInvoked = true;
          invokedWith = args;
        }
      };

      const args = ['foo'];
      Utils.invoke('getName', obj, ...args);
      expect(wasInvoked).toEqual(true);
      expect(invokedWith).toEqual(args);
    });
  });

  describe('greaterScopeId', () => {
    it('should return the object with the greater scope id', () => {
      const objA = {
        $getScope: () => 1
      };

      const objB = {
        getScope: () => 2
      };

      expect(Utils.greaterScopeId(objA, objB)).toEqual(objB);
    });
  });

  describe('mergeDeep', () => {
    it('should overwrite literals', () => {
      const objA = {foo: 'bar'};
      const objB = {foo: 'baz'};

      expect(Utils.mergeDeep(objA, objB)).toEqual({
        foo: 'baz'
      });
    });

    it('should append arrays', () => {
      const objA = {
        foo: [1, 2, 3]
      };

      const objB = {
        foo: [4, 5, 6]
      };

      expect(Utils.mergeDeep(objA, objB)).toEqual({
        foo: [1, 2, 3, 4, 5, 6]
      });
    });

    it('should merge objects', () => {
      const objA = {
        foo: {
          bar: {
            baz: 1
          }
        }
      };

      const objB = {
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

  describe('applyToCollection', () => {
    const item = id => ({
      id,
      setName (name) {
        this.name = name;
      }
    });

    const collection = [
      item(1),
      item(2)
    ];

    const data = {
      1: 'foo',
      2: 'bar'
    };

    Utils.applyToCollection(collection, R.prop('id'), 'setName', data);
    expect(collection[0].name).toEqual('foo');
    expect(collection[1].name).toEqual('bar');
  });
});
