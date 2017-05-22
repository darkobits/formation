import angular from 'angular';

import {
  concat,
  find,
  is,
  map,
  path
} from 'ramda';

import app from '../../app';

import {
  FormationControl
} from '../../classes/FormationControl';

import {
  COMPONENT_CONFIGURATION,
  DEFAULT_PREFIX,
  FORM_COMPONENT_NAME,
  FORM_CONTROLLER
} from '../constants';

import {
  RegisterNgForm,
  RegisterNgModel
} from '../interfaces';

import {
  assertType,
  capitalizeFirst,
  isFunction,
  lowercaseFirst,
  mergeDeep,
  throwError
} from '../utils';


// ----- Private Data ----------------------------------------------------------

/**
 * Set to true during Angular's configuration phase to prevent Formation
 * configuration.
 *
 * @type {boolean}
 */
let allowConfiguration = true;


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


/**
 * Internal reference to Angular's $compileProvider, used for registering
 * directives.
 *
 * @type {object}
 */
let compileProvider;


// ----- Semi-Public Functions -------------------------------------------------

/**
 * Adds the provided name to the list of registered components.
 *
 * @param  {string} name
 */
export function $registerComponent (name, definition) {
  registeredComponents.push(name);

  // Add a run block that will register the provided component during
  // bootstrapping.
  app.run(() => {
    if (typeof definition === 'function') {
      compileProvider.directive(lowercaseFirst(name), definition);
    } else {
      compileProvider.component(lowercaseFirst(name), definition);
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


/**
 * Curried assertType.
 *
 * Remaining arguments:
 *
 * @param {function|array} types
 * @param {string} label
 * @param {any} value
 *
 * @return {boolean}
 */
const check = assertType('configure');


// ----- Public Functions ------------------------------------------------------

/**
 * Registers a Formation control as an Angular component using the provided
 * name and component definition object.
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
export function configure (opts) {
  if (!allowConfiguration) {
    throwError(`Formation must be configured prior to Angular's "run" phase.`);
  }

  check(Object, 'options', opts);

  if (check([String, undefined], 'showErrorsOn', opts.showErrorsOn)) {
    showErrorsOnStr = opts.showErrorsOn;
  }

  if (check([String, undefined], 'prefix', opts.prefix)) {
    prefix = opts.prefix;
  }
}


// ----- Decorators ------------------------------------------------------------

function decorateModuleFn (obj, fnKey, context) {
  const origModuleFn = obj[fnKey];

  obj[fnKey] = (name, requires, configFn) => {
    if (Array.isArray(requires)) {
      requires = map(req => req.toString(), requires);
    }

    return Reflect.apply(origModuleFn, context, [name, requires, configFn]);
  };
}

// Mildly naughty: Decorate angular.module such that it will invoke toString()
// on dependencies so we can pass string objects (or anything that implements
// toString) as dependencies.
decorateModuleFn(angular, 'module', angular);

if (angular.mock) {
  decorateModuleFn(angular.mock, 'module', angular);
}


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

        if (fmFormController && RegisterNgForm.isImplementedBy(fmFormController)) {
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

        if (fmComponentController && RegisterNgModel.isImplementedBy(fmComponentController)) {
          // If we are the child of a Formation control, register with the
          // control.
          fmComponentController[RegisterNgModel](ngModelController);
        } else if (fmFormController && RegisterNgModel.isImplementedBy(fmFormController)) {
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

// ----- Misc ------------------------------------------------------------------

app.config($compileProvider => {
  // Save a reference to Angular's $compileProvider. Used by registerComponent.
  compileProvider = $compileProvider;
});


app.run(() => {
  // Prevent calls to configure() once the "run" phase has started.
  allowConfiguration = false;
});
