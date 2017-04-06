import R from 'ramda';
import app from '../app';

import {
  FormController
} from '../components/Form/Form';

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
let registeredComponents;


// ----- Semi-Private Functions ------------------------------------------------

/**
 * Adds the provided name to the list of registered components.
 *
 * @param  {string} name
 */
export function $registerComponent (name, definition) {
  registeredComponents = (registeredComponents || []).concat(String(name));

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
  // Decorate form and ngForm.
  ['formDirective', 'ngFormDirective'].forEach(directiveName => {
    $provide.decorator(directiveName, $delegate => {
      const [ngFormDirective] = $delegate;
      const compile = ngFormDirective.compile;

      // Add the Formation form controller as an optional parent require.
      ngFormDirective.require = ngFormDirective.require.concat(`?^${FORM_COMPONENT_NAME}`);

      ngFormDirective.compile = function () {
        // Invoke original compile function to get link object it returns.
        const link = Reflect.apply(compile, this, arguments);

        // Return new link object.
        return {
          pre () {
            // Invoke original pre-link.
            if (R.is(Function, link.pre)) {
              Reflect.apply(link.pre, this, arguments);
            }
          },
          post (scope, element, attributes, controllers) {
            // Invoke original post-link.
            if (R.is(Function, link.post)) {
              Reflect.apply(link.post, this, arguments);
            }

            // Get a reference to the Angular Form controller.
            const [ngFormController] = controllers;

            // Get a reference to the Formation form controller.
            const fmFormController = R.find(R.is(FormController), controllers);

            if (fmFormController && R.is(Function, fmFormController[RegisterNgForm])) {
              fmFormController[RegisterNgForm](ngFormController);
            }
          }
        };
      };

      return $delegate;
    });
  });


  // Decorate ngModel.
  $provide.decorator('ngModelDirective', $delegate => {
    const [ngModelDirective] = $delegate;
    const compile = ngModelDirective.compile;

    // Add each registered component as an optional parent require on ngModel.
    ngModelDirective.require = R.concat(
      ngModelDirective.require,
      R.map(component => `?^^${component}`, registeredComponents)
    );

    ngModelDirective.compile = function () {
      // Invoke original compile to get link object.
      const link = Reflect.apply(compile, this, arguments);

      // Return new link object.
      return {
        pre () {
          // Invoke original pre-link.
          Reflect.apply(link.pre, this, arguments);
        },
        post (scope, element, attributes, controllers) {
          // Invoke original post-link.
          Reflect.apply(link.post, this, arguments);

          // Get a reference to the ngModel controller.
          const [ngModelController] = controllers;

          // Get a reference to parent Formation controls, if any.
          const fmComponentController = R.find(R.is(FormationControl), controllers);

          // Get a reference to parent Formation forms, if any.
          const fmFormController = R.find(R.is(FormController), controllers);

          if (fmComponentController && R.is(Function, fmComponentController[RegisterNgModel])) {
            // If we are the child of a Formation control, register with the
            // control.
            fmComponentController[RegisterNgModel](ngModelController);
          } else if (fmFormController && R.is(Function, fmFormController[RegisterNgModel])) {
            // Otherwise, if we are the child of a Formation form, register with
            // the form.
            fmFormController[RegisterNgModel](ngModelController);
          }
        }
      };
    };

    return $delegate;
  });
});
