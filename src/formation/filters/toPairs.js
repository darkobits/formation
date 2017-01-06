import formationModule from 'formation/module';
import R from 'ramda';

formationModule.filter('toPairs', () => {
  return R.memoize(input => {
    try {
      return R.toPairs(input);
    } catch (e) {
      return input;
    }
  });
});
