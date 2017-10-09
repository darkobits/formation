import mergeEntries from './mergeEntries';


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
