import NgUnit from '../helpers';
import '../../src/index';


describe('toPairs Filter', () => {
  let T;

  beforeEach(() => {
    T = new NgUnit();
    T.prepareModule('Formation');
    T.prepareFilter('toPairs');
  });

  describe('toPairs', () => {
    it('convert an object to an array of tuples', () => {
      let input = {foo: 'bar'};
      let expected = [['foo', 'bar']];

      expect(T.spec.toPairs(input)).toEqual(expected);
    });

    it('should ignore non-objects', () => {
      let input = 'foo';

      expect(T.spec.toPairs(input)).toBe(input);
    });
  });
});
