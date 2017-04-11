import Formation from '../index';

import {
  module,
  filter
} from '../../tests/unity';


describe('entries Filter', () => {
  let T;

  beforeEach(() => {
    module(Formation);
    T = filter('entries');
  });

  describe('entries', () => {
    it('convert an object to an array of tuples', () => {
      const input = {foo: 'bar'};
      const expected = [['foo', 'bar']];

      expect(T.entries(input)).toEqual(expected);
    });

    it('should ignore non-objects', () => {
      const input = 'foo';

      expect(T.entries(input)).toBe(input);
    });
  });
});
