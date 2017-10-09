import toPairsWith from './toPairsWith';


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
