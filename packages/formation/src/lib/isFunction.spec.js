import isFunction from './isFunction';


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
