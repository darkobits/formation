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
 * @alias FORM_GROUP_COMPONENT_NAME
 *
 * @description
 *
 * Name used for the form group component (not prefixed).
 *
 * @type {String}
 */
export const FORM_GROUP_COMPONENT_NAME = 'fmGroup';


/* ----- BEGIN INTERFACES --------------------------------------------------- */


export const APPLY_CONFIGURATION = '$applyConfiguration';


/**
 * @memberOf constants
 * @alias REGISTER_FORM_CALLBACK
 *
 * @description
 *
 * Key at which controllers should implement a function to handle ngForm
 * registration.
 *
 * @type {string}
 */
export const REGISTER_FORM_CALLBACK = '$fmRegisterForm';


/**
 * @memberOf constants
 * @alias REGISTER_NG_MODEL_CALLBACK
 *
 * @description
 *
 * Key at which controllers should implement a function to handle ngModel
 * registration.
 *
 * @type {string}
 */
export const REGISTER_NG_MODEL_CALLBACK = '$fmRegisterNgModel';


/* ----- END INTERFACES ----------------------------------------------------- */


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
 * Property added to validator function objects to signal to Formation that they
 * need to be configured.
 *
 * @type {string}
 */
export const CONFIGURABLE_VALIDATOR = '$fmConfigurableValidator';
