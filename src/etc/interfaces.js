import {
  Any,
  Interface
} from '../classes/interface';


/**
 * Used by controls, forms, and form groups to ingest configuration data.
 *
 * @type {Interface}
 */
export const Configure = new Interface('Configure');


/**
 * Called by decorated ngModel controllers to register with a Formation control
 * or form.
 *
 * @type {Interface}
 */
export const RegisterNgModel = new Interface('RegisterNgModel', [Object]);


/**
 * Called by decorated form/ngForm controllers to register with a form or form
 * group.
 *
 * @type {Interface}
 */
export const RegisterNgForm = new Interface('RegisterNgForm', [Object]);


/**
 * Called by Formation controls to register with a Formation form or form group
 * upon instantiation.
 *
 * @type {Interface}
 */
export const RegisterControl = new Interface('RegisterControl', [Object]);


/**
 * Used by Formation forms and form groups to register with a parent form.
 *
 * @type {Interface}
 */
export const RegisterForm = new Interface('RegisterForm', [Object]);


/**
 * Implemented by controls to set custom error messages, and by forms to ingest
 * custom error message data structures to delegate to controls.
 *
 * @type {Interface}
 */
export const SetCustomErrorMessage = new Interface('SetCustomErrorMessage');


/**
 * Implemented by controls to set custom error messages, and by forms to ingest
 * custom error message data structures to delegate to controls.
 *
 * @type {Interface}
 */
export const ClearCustomErrorMessage = new Interface('ClearCustomErrorMessage');


/**
 * Model value getter for forms, form groups, and controls.
 *
 * @type {Interface}
 */
export const GetModelValue = new Interface('GetModelValue');


/**
 * Model value setter for forms, form groups, and controls.
 *
 * @type {Interface}
 */
export const SetModelValue = new Interface('SetModelValue', [Any]);


/**
 * Allows objects to implement a 'resettable' method.
 *
 * @type {Interface}
 */
export const Reset = new Interface('Reset');
