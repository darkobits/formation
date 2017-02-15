export default {
  defer () {
    let deferred = {};

    let p = new Promise((resolve, reject) => {
      deferred.resolve = resolve;
      deferred.reject = reject;
    });

    deferred.promise = p;

    return deferred;
  },
  resolve (value) {
    return Promise.resolve(value);
  },
  reject (value) {
    return Promise.reject(value);
  },
  when (value) {
    return Promise.resolve().then(() => value);
  }
};
