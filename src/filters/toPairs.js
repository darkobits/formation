import app from 'app';
import R from 'ramda';

app.filter('toPairs', () => {
  return R.memoize(input => {
    try {
      return R.toPairs(input);
    } catch (e) {
      return input;
    }
  });
});
