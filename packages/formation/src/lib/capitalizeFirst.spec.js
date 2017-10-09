import capitalizeFirst from './capitalizeFirst';


describe('capitalizeFirst', () => {
  it('should capitalize a string', () => {
    const input = 'foo';

    expect(capitalizeFirst(input)).toBe('Foo');
  });
});
