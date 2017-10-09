import invoke from './invoke';


describe('invoke', () => {
  it('should invoke the named method on the provided object with provided arguments', () => {
    const obj = {
      getName: jest.fn()
    };

    const args = ['foo'];

    invoke('getName', obj, ...args);

    expect(obj.getName).toHaveBeenCalledWith(...args);
  });
});
