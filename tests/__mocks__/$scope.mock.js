import R from 'ramda';

export default {
  $applyAsync (fn) {
    fn();
  },
  $watch (expression, cb) {
    let getValue = () => R.path(expression.split('.'), this);
    let oldValue;

    let clear = setInterval(() => {
      let newValue = getValue();

      if (oldValue === undefined) {
        cb(newValue, undefined);
      } else if (newValue !== oldValue) {
        cb(newValue, oldValue);
        oldValue = newValue;
      }
    }, 1);

    return () => {
      clearInterval(clear);
    };
  }
};
