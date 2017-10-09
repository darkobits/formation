import assignToScope from './assignToScope';


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
