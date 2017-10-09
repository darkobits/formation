import mergeDeep from './mergeDeep';


describe('mergeDeep', () => {
  it('should overwrite literals', () => {
    const objA = {foo: 'bar'};
    const objB = {foo: 'baz'};

    expect(mergeDeep(objA, objB)).toEqual({
      foo: 'baz'
    });
  });

  it('should prepend arrays', () => {
    const objA = {
      foo: [1, 2, 3]
    };

    const objB = {
      foo: [4, 5, 6]
    };

    expect(mergeDeep(objA, objB)).toEqual({
      foo: [4, 5, 6, 1, 2, 3]
    });
  });

  it('should merge objects', () => {
    const objA = {
      foo: {
        bar: {
          baz: 1
        }
      }
    };

    const objB = {
      foo: {
        bar: {
          bleep: 2
        }
      }
    };

    expect(mergeDeep(objA, objB)).toEqual({
      foo: {
        bar: {
          baz: 1,
          bleep: 2
        }
      }
    });
  });
});
