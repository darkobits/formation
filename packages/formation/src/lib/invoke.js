import isFunction from './isFunction';


/**
 * Invokes the named method on the provided object (if it exists), optionally
 * passing any additional arguments as parameters to the method.
 *
 * @param  {string}  method - Method name to invoke.
 * @param  {object}  obj    - Target object.
 * @param  {arglist} [args] - Additional arguments to pass to 'method'.
 * @return {*}
 */
export default function invoke (method, obj, ...args) {
  return obj && isFunction(obj[method]) && obj[method](...args);
}
