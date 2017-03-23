import R from 'ramda';
import app from '../app';


app.filter('entries', () => {
  return R.memoize(input => {
    if (R.is(Object, input)) {
      return Object.entries(input);
    }

    return input;
  });
});
