// -----------------------------------------------------------------------------
// ----- Shared Constants ------------------------------------------------------
// -----------------------------------------------------------------------------

/**
 * Named used for the Formation Angular module.
 *
 * @type {string}
 */
export const MODULE_NAME = 'Formation';


/**
 * Name used for the form component (not prefixed).
 *
 * @type {string}
 */
export const FORM_COMPONENT_NAME = 'fm';


/**
 * Name used for the form group component (not prefixed).
 *
 * @type {string}
 */
export const FORM_GROUP_COMPONENT_NAME = 'fmGroup';


/**
 * Prefix used for all components registered with Formation.registerComponent.
 * This incluedes all built-in components.
 *
 * @type {string}
 */
export const DEFAULT_PREFIX = 'fm';


/**
 * Key in components' "require" definition that should reference the Formation
 * form controller.

 * @type {string}
 */
export const FORM_CONTROLLER = '$formController';


/**
 * Key at which controls that use ngModel assign a reference to their ngModel
 * controller.
 *
 * @type {string}
 */
export const NG_MODEL_CTRL = '$ngModelCtrl';


/**
 * Key in components' bindings that should contain control configuration.
 *
 * Shared between: form, component sub-classes.
 *
 * @type {string}
 */
export const COMPONENT_CONFIGURATION = '$configuration';


/**
 * Error validation key to use for signaling the custom error state.
 *
 * @type {string}
 */
export const CUSTOM_ERROR_KEY = '$custom';
