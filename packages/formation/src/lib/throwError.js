import {MODULE_NAME} from 'etc/constants';


/**
 * Throws a new error with the provided message, prefixed with the module
 * name.
 *
 * @param  {string} message
 */
export default function throwError (message) {
  throw new Error(`[${MODULE_NAME}] ${message}`);
}
