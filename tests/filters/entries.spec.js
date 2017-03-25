import NgUnit from '../helpers';
import '../../src/index';


describe('entries Filter', () => {
  let T;

  beforeEach(() => {
    T = new NgUnit();
    T.prepareModule('Formation');
    T.prepareFilter('entries');
  });

  describe('entries', () => {
    it('convert an object to an array of tuples', () => {
      let input = {foo: 'bar'};
      let expected = [['foo', 'bar']];

      expect(T.spec.entries(input)).toEqual(expected);
    });

    it('should ignore non-objects', () => {
      let input = 'foo';

      expect(T.spec.entries(input)).toBe(input);
    });
  });
});
