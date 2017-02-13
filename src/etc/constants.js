// -----------------------------------------------------------------------------
// ----- Shared Constants ------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * @namespace constants
 */


/**
 * @memberOf constants
 * @alias MODULE_NAME
 *
 * @description
 *
 * Named used for the Formation Angular module.
 *
 * @type {String}
 */
export const MODULE_NAME = 'Formation';


/**
 * @memberOf constants
 * @alias FORM_COMPONENT_NAME
 *
 * @description
 *
 * Name used for the form component (not prefixed).
 *
 * @type {String}
 */
export const FORM_COMPONENT_NAME = 'fm';


/**
 * @memberOf constants
 * @alias REGISTER_FORM_CALLBACK
 *
 * @description
 *
 * Key at which controllers should implement a function to handle ngForm
 * registration.
 *
 * @type {symbol}
 */
export const REGISTER_FORM_CALLBACK = Symbol('registerForm');


/**
 * @memberOf constants
 * @alias REGISTER_NG_MODEL_CALLBACK
 *
 * @description
 *
 * Key at which controllers should implement a function to handle ngModel
 * registration.
 *
 * @type {symbol}
 */
export const REGISTER_NG_MODEL_CALLBACK = Symbol('registerNgModel');


/**
 * @memberOf constants
 * @alias DEFAULT_PREFIX
 *
 * @description
 *
 * Prefix used for all components registered with Formation.registerComponent.
 * This incluedes all built-in components.
 *
 * @type {String}
 */
export const DEFAULT_PREFIX = 'fm';


/**
 * @memberOf constants
 * @alias CUSTOM_ERROR_KEY
 *
 * @description
 *
 * Error validation key to use for signaling the custom error state.
 *
 * @type {string}
 */
export const CUSTOM_ERROR_KEY = '$custom';


/**
 * @memberOf constants
 * @alias CONFIGURABLE_VALIDATOR
 *
 * @description
 *
 * Symbol added to validator function objects to signal to Formation that they
 * need to be configured.
 *
 * @type {symbol}
 */
export const CONFIGURABLE_VALIDATOR = Symbol('configurableValidator');
