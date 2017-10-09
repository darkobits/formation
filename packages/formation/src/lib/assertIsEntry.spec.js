import assertIsEntry from './assertIsEntry';


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
