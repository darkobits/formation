import {
  concat,
  find,
  is,
  map,
  path
} from 'ramda';

import app from '../app';

import {
  FormationControl
} from '../classes/FormationControl';

import {
  COMPONENT_CONFIGURATION,
  DEFAULT_PREFIX,
  FORM_COMPONENT_NAME,
  FORM_CONTROLLER
} from './constants';

import {
  RegisterNgForm,
  RegisterNgModel
} from './interfaces';

import {
  capitalizeFirst,
  isFunction,
  lowercaseFirst,
  mergeDeep
} from './utils';


// ----- Private Data ----------------------------------------------------------

/**
 * @private
 *
 * Configured component prefix.
 *
 * @type {string}
 */
let prefix = DEFAULT_PREFIX;


/**
 * @private
 *
 * Global setting for error behavior.
 *
 * @type {string}
 */
let showErrorsOnStr;


/**
 * @private
 *
 * Counter for getNextId(), used to assign unique IDs to unnamed forms.
 *
 * @type {number}
 */
let counter = -1;


/**
 * @private
 *
 * Maintains a list of all components and directives registered with the
 * service.
 *
 * @type {array}
 */
const registeredComponents = [];


// ----- Semi-Private Functions ------------------------------------------------

/**
 * Adds the provided name to the list of registered components.
 *
 * @param  {string} name
 */
export function $registerComponent (name, definition) {
  registeredComponents.push(name);

  app.config($compileProvider => {
    if (typeof definition === 'function') {
      $compileProvider.directive(lowercaseFirst(name), definition);
    } else {
      $compileProvider.component(lowercaseFirst(name), definition);
    }
  });
}


/**
 * Returns the next available ID, used for assigning ID attributes to
 * unnamed form instances.
 *
 * @private
 *
 * @return {number}
 */
export function $getNextId () {
  return ++counter;
}


/**
 * Returns globally-configured error flags.
 *
 * @private
 *
 * @return {string}
 */
export function $getShowErrorsOnStr () {
  return showErrorsOnStr;
}


/**
 * Returns a prefixed version of the provided string.
 *
 * @private
 *
 * Formation.$getPrefixedName('Input') // => 'fmInput';
 *
 * @param  {string} name
 * @return {string}
 */
export function $getPrefixedName (name) {
  return `${prefix || DEFAULT_PREFIX}${capitalizeFirst(name)}`;
}


// ----- Public Functions ------------------------------------------------------

/**
 * Registers a Formation control.
 *
 * @param  {string} name - Control name. Will be prefixed using the configured
 *   or default prefix.
 * @param  {object} definition - Component definition object.
 */
export function registerControl (name, definition) {
  const normalizedName = lowercaseFirst($getPrefixedName(name));

  $registerComponent(normalizedName, mergeDeep({
    bindings: {
      [COMPONENT_CONFIGURATION]: '<config',
      $ngDisabled: '<ngDisabled'
    },
    require: {
      [FORM_CONTROLLER]: `^^${FORM_COMPONENT_NAME}`
    }
  }, definition));
}


/**
 * Allows consumers to configure Formation behavior.
 *
 * @param {object} opts
 * @param {string} [opts.showErrorsOn] - Comma/space-delimited string of control
 *   or form states that, when true, will cause ngMessage errors to display.
 * @param {string} [opts.prefix] - Overrides the default component prefix for
 *   all formation controls.
 */
export function FormationConfigurator (opts) {
  if (opts.showErrorsOn) {
    showErrorsOnStr = opts.showErrorsOn;
  }

  if (opts.prefix) {
    prefix = String(opts.prefix);
  }
}


// ----- Form & ngModel Decorators ---------------------------------------------

app.config($provide => {
  const decorate = [
    // Decoration spec for form/ngForm.
    {
      directives: ['formDirective', 'ngFormDirective'],
      require: [`?^^fm`],
      postLink (scope, element, attributes, controllers) {
        // Get a reference to the Angular Form controller.
        const [ngFormController] = controllers;

        // Get a reference to parent Formation forms, if any. Use 'propEq'
        // here rather than 'is' to avoid a circular dependence between this
        // module and Form.js.
        const fmFormController = find(controller => path(['constructor', FORM_CONTROLLER], controller), controllers);

        if (fmFormController && isFunction(fmFormController[RegisterNgForm])) {
          fmFormController[RegisterNgForm](ngFormController);
        }
      }
    },

    // Decoration spec for ngModel.
    {
      directives: ['ngModelDirective'],
      require: map(component => `?^^${component}`, registeredComponents),
      postLink (scope, element, attributes, controllers) {
        // Get a reference to the ngModel controller.
        const [ngModelController] = controllers;

        // Get a reference to parent Formation controls, if any.
        const fmComponentController = find(is(FormationControl), controllers);

        // Get a reference to parent Formation forms, if any. Use 'propEq'
        // here rather than 'is' to avoid a circular dependence between this
        // module and Form.js.
        const fmFormController = find(controller => path(['constructor', FORM_CONTROLLER], controller), controllers);

        if (fmComponentController && isFunction(fmComponentController[RegisterNgModel])) {
          // If we are the child of a Formation control, register with the
          // control.
          fmComponentController[RegisterNgModel](ngModelController);
        } else if (fmFormController && isFunction(fmFormController[RegisterNgModel])) {
          // Otherwise, if we are the child of a Formation form, register with
          // the form.
          fmFormController[RegisterNgModel](ngModelController);
        }
      }
    }
  ];


  decorate.forEach(({directives, require, postLink} = {}) => {
    directives.forEach(directiveName => {
      $provide.decorator(directiveName, $delegate => {
        const [directiveSpec] = $delegate;
        const compile = directiveSpec.compile;

        // Add requires.
        directiveSpec.require = concat(directiveSpec.require || [], require);

        directiveSpec.compile = function () {
          // Invoke original compile to get link object.
          const link = Reflect.apply(compile, this, arguments);

          // Return new link object.
          return {
            pre () {
              if (isFunction(link.pre)) {
                // Invoke original pre-link.
                Reflect.apply(link.pre, this, arguments);
              }
            },
            post () {
              if (isFunction(link.post)) {
                // Invoke original post-link.
                Reflect.apply(link.post, this, arguments);
              }

              // Invoke new post-link.
              Reflect.apply(postLink, this, arguments);
            }
          };
        };

        return $delegate;
      });
    });
  });
});
