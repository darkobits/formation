import greaterScopeId from './greaterScopeId';


describe('greaterScopeId', () => {
  it('should return the object with the greater scope id', () => {
    const objA = {
      $getScope: () => 1
    };

    const objB = {
      getScope: () => 2
    };

    expect(greaterScopeId(objA, objB)).toEqual(objB);
  });
});
