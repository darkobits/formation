import R from 'ramda';
import app from '../app';


app.filter('toPairs', () => {
  return R.memoize(input => {
    if (R.is(Object, input)) {
      return R.toPairs(input);
    }

    return input;
  });
});
