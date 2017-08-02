import {
  __,
  prop
} from 'ramda';

import {
  applyToCollection,
  assertIsEntry,
  assertType,
  assignToScope,
  capitalizeFirst,
  greaterScopeId,
  invoke,
  isFunction,
  lowercaseFirst,
  mergeDeep,
  mergeEntries,
  parseFlags,
  throwError,
  toPairsWith
} from './utils';


describe('Utils', () => {
  describe('assertIsEntry', () => {
    it('should require its argument to be a [key, value] pair', () => {
      expect(() => {
        assertIsEntry(null);
      }).toThrow('Expected [key, value] entry, but got Null');

      expect(() => {
        assertIsEntry([]);
      }).toThrow('Expected [key, value] entry, but got Array');

      expect(() => {
        assertIsEntry(['foo', 'bar']);
      }).not.toThrow();
    });
  });

  describe('isFunction', () => {
    it('should assert that its argument is a function', () => {
      expect(isFunction(() => {})).toBe(true);
      expect(isFunction(Array.isArray)).toBe(true);

      // Including jest.fn(), which does not pass using R.is.
      expect(isFunction(jest.fn())).toBe(true);

      expect(isFunction({})).toBe(false);
      expect(isFunction(null)).toBe(false);
    });
  });

  describe('throwError', () => {
    it('should throw an error with the provided message', () => {
      const message = 'foo';
      expect(() => throwError(message)).toThrow(message);
    });
  });

  describe('assertType', () => {
    const testAssertType = assertType('Test', __, 'value');

    it('should check for type Function', () => {
      expect(testAssertType(Function, function () {})).toBe(true);
      expect(testAssertType([Function, String], function () {})).toBe(true);

      expect(() => {
        testAssertType(Function, null);
      }).toThrow('Test expected value to be of type Function, but got Null.');

      expect(() => {
        testAssertType([Function, String], null);
      }).toThrow('Test expected value to be of type Function or String, but got Null.');
    });

    it('should check for type Array', () => {
      expect(testAssertType(Array, [])).toBe(true);
      expect(testAssertType([Array, String], [])).toBe(true);

      expect(() => {
        testAssertType(Array, null);
      }).toThrow('Test expected value to be of type Array, but got Null.');

      expect(() => {
        testAssertType([Array, String], null);
      }).toThrow('Test expected value to be of type Array or String, but got Null.');
    });

    it('should check for type Undefined', () => {
      expect(testAssertType(undefined, undefined)).toBe(true);
      expect(testAssertType([undefined, String], undefined)).toBe(true);

      expect(() => {
        testAssertType(undefined, 'foo');
      }).toThrow('Test expected value to be of type Undefined, but got String.');

      expect(() => {
        testAssertType([undefined, Array], 'foo');
      }).toThrow('Test expected value to be of type Undefined or Array, but got String.');
    });

    it('should check for type Null', () => {
      expect(testAssertType(null, null)).toBe(true);
      expect(testAssertType([null, String], null)).toBe(true);

      expect(() => {
        testAssertType(null, 'foo');
      }).toThrow('Test expected value to be of type Null, but got String.');

      expect(() => {
        testAssertType([null, Array], 'foo');
      }).toThrow('Test expected value to be of type Null or Array, but got String.');
    });

    it('should check for the provided constructor', () => {
      function Foo () { }

      const myFoo = new Foo();

      class Bar { }

      const myBar = new Bar();

      expect(testAssertType(Foo, myFoo)).toBe(true);
      expect(testAssertType([Foo, String], myFoo)).toBe(true);

      expect(testAssertType(Bar, myBar)).toBe(true);
      expect(testAssertType([Bar, String], myBar)).toBe(true);

      expect(() => {
        testAssertType(Foo, 'foo');
      }).toThrow('Test expected value to be of type Foo, but got String.');

      expect(() => {
        testAssertType([Foo, Array], 'foo');
      }).toThrow('Test expected value to be of type Foo or Array, but got String.');

      expect(() => {
        testAssertType(Bar, 'foo');
      }).toThrow('Test expected value to be of type Bar, but got String.');

      expect(() => {
        testAssertType([Bar, Array], 'foo');
      }).toThrow('Test expected value to be of type Bar or Array, but got String.');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize a string', () => {
      const input = 'foo';

      expect(capitalizeFirst(input)).toBe('Foo');
    });
  });

  describe('lowercaseFirst', () => {
    it('should convert the first character of a string to lowercase', () => {
      const input = 'Foo';

      expect(lowercaseFirst(input)).toBe('foo');
    });
  });

  describe('parseFlags', () => {
    it('should convert a comma-delimited string into an array', () => {
      const input = 'foo,bar,baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(parseFlags(input)).toEqual(expected);
    });

    it('should convert a space-delimited string into an array', () => {
      const input = 'foo bar baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(parseFlags(input)).toEqual(expected);
    });

    it('should convert a comma and space-delimited string into an array', () => {
      const input = 'foo, bar, baz';
      const expected = ['$foo', '$bar', '$baz'];
      expect(parseFlags(input)).toEqual(expected);
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
      assignToScope($parse, {}, value, expression);

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

        expect(toPairsWith(keyFn, collection)).toEqual(expected);
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

        expect(toPairsWith(keyFn, valueFn, collection)).toEqual(expected);
      });
    });

    describe('when passed a bad key generation function', () => {
      it('should throw an error', () => {
        expect(() => toPairsWith(false, [])).toThrow('to be of type "Function"');
      });
    });

    describe('when passed a bad value generation function', () => {
      it('should throw an error', () => {
        expect(() => toPairsWith(i => i, false, [])).toThrow('to be of type "Function"');
      });
    });

    describe('when passed a bad collection', () => {
      it('should throw an error', () => {
        expect(() => toPairsWith(i => i, i => i, 'foo')).toThrow('to be of type "Array"');
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

      expect(mergeEntries(dest, src)).toEqual(expected);
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

      expect(mergeEntries(dest, src)).toEqual(expected);
    });

    describe('error-handling', () => {
      it('should throw an error when passed non-arrays', () => {
        expect(() => mergeEntries('foo', [])).toThrow('first argument');
      });

      it('should throw an error when passed non-arrays', () => {
        expect(() => mergeEntries([], 'foo')).toThrow('second argument');
      });

      it('should throw an error when arrays contain non-entries', () => {
        expect(() => mergeEntries([1], [[1, 'foo']])).toThrow('Expected [key, value] entry');
        expect(() => mergeEntries([[1, 'foo']], [1])).toThrow('Expected [key, value] entry');
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
      invoke('getName', obj, ...args);
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

      expect(greaterScopeId(objA, objB)).toEqual(objB);
    });
  });

  describe('mergeDeep', () => {
    it('should overwrite literals', () => {
      const objA = {foo: 'bar'};
      const objB = {foo: 'baz'};

      expect(mergeDeep(objA, objB)).toEqual({
        foo: 'baz'
      });
    });

    it('should prepend arrays', () => {
      const objA = {
        foo: [1, 2, 3]
      };

      const objB = {
        foo: [4, 5, 6]
      };

      expect(mergeDeep(objA, objB)).toEqual({
        foo: [4, 5, 6, 1, 2, 3]
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

      expect(mergeDeep(objA, objB)).toEqual({
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

    applyToCollection(collection, prop('id'), 'setName', data);
    expect(collection[0].name).toEqual('foo');
    expect(collection[1].name).toEqual('bar');
  });
});
