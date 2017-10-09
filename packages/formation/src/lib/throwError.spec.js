import throwError from './throwError';


describe('throwError', () => {
  it('should throw an error with the provided message', () => {
    const message = 'foo';
    expect(() => throwError(message)).toThrow(message);
  });
});
