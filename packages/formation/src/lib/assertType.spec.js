import {__} from 'ramda';
import assertType from './assertType';


describe('assertType', () => {
  const testAssertType = assertType('Test', __, 'value');

  it('should check for type Function', () => {
    expect(testAssertType(Function, function () {})).toBe(true);
    expect(testAssertType([Function, String], function () {})).toBe(true);

    expect(() => {
      testAssertType(Function, null);
    }).toThrow('Test expected value to be of type Function, but got Null.');

    expect(() => {
      testAssertType([Function, String], null);
    }).toThrow('Test expected value to be of type Function or String, but got Null.');
  });

  it('should check for type Array', () => {
    expect(testAssertType(Array, [])).toBe(true);
    expect(testAssertType([Array, String], [])).toBe(true);

    expect(() => {
      testAssertType(Array, null);
    }).toThrow('Test expected value to be of type Array, but got Null.');

    expect(() => {
      testAssertType([Array, String], null);
    }).toThrow('Test expected value to be of type Array or String, but got Null.');
  });

  it('should check for type Undefined', () => {
    expect(testAssertType(undefined, undefined)).toBe(true);
    expect(testAssertType([undefined, String], undefined)).toBe(true);

    expect(() => {
      testAssertType(undefined, 'foo');
    }).toThrow('Test expected value to be of type Undefined, but got String.');

    expect(() => {
      testAssertType([undefined, Array], 'foo');
    }).toThrow('Test expected value to be of type Undefined or Array, but got String.');
  });

  it('should check for type Null', () => {
    expect(testAssertType(null, null)).toBe(true);
    expect(testAssertType([null, String], null)).toBe(true);

    expect(() => {
      testAssertType(null, 'foo');
    }).toThrow('Test expected value to be of type Null, but got String.');

    expect(() => {
      testAssertType([null, Array], 'foo');
    }).toThrow('Test expected value to be of type Null or Array, but got String.');
  });

  it('should check for the provided constructor', () => {
    function Foo () { }

    const myFoo = new Foo();

    class Bar { }

    const myBar = new Bar();

    expect(testAssertType(Foo, myFoo)).toBe(true);
    expect(testAssertType([Foo, String], myFoo)).toBe(true);

    expect(testAssertType(Bar, myBar)).toBe(true);
    expect(testAssertType([Bar, String], myBar)).toBe(true);

    expect(() => {
      testAssertType(Foo, 'foo');
    }).toThrow('Test expected value to be of type Foo, but got String.');

    expect(() => {
      testAssertType([Foo, Array], 'foo');
    }).toThrow('Test expected value to be of type Foo or Array, but got String.');

    expect(() => {
      testAssertType(Bar, 'foo');
    }).toThrow('Test expected value to be of type Bar, but got String.');

    expect(() => {
      testAssertType([Bar, Array], 'foo');
    }).toThrow('Test expected value to be of type Bar or Array, but got String.');
  });
});
