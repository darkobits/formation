import Interface from '../classes/interface';


/**
 * Allows classes to ingest configuration data.
 *
 * @type {Interface}
 */
export const Configure = new Interface('Configure');


/**
 * Allows ngModel controllers to register with a class upon instantiation.
 *
 * @type {Interface}
 */
export const RegisterNgModel = new Interface('RegisterNgModel', [Object]);


/**
 * Allows Formation controls to register with a Formation form upon
 * instantiation.
 *
 * @type {Interface}
 */
export const RegisterControl = new Interface('RegisterControl', [Object]);


/**
 * Allows Formation form controllers to register with a class upon
 * instantiation.
 *
 * @type {Interface}
 */
export const RegisterForm = new Interface('RegisterForm', [Object]);


/**
 * Allows form/ngForm controllers to register with a class upon instantiation.
 *
 * @type {Interface}
 */
export const RegisterNgForm = new Interface('RegisterNgForm', [Object]);
