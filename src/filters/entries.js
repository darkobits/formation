import {
  memoize,
  is
} from 'ramda';

import app from '../app';


app.filter('entries', () => {
  return memoize(input => {
    if (is(Object, input)) {
      return Object.entries(input);
    }

    return input;
  });
});
