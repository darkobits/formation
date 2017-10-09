import lowercaseFirst from './lowercaseFirst';


describe('lowercaseFirst', () => {
  it('should convert the first character of a string to lowercase', () => {
    const input = 'Foo';

    expect(lowercaseFirst(input)).toBe('foo');
  });
});
