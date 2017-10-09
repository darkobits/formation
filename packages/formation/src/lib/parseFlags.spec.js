import parseFlags from './parseFlags';


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
