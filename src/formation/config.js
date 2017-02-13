import formationModule from 'formation/module';
import R from 'ramda';

import {
  FormController
} from 'formation/components/Form/Form';

import {
  FormationControl
} from 'formation/components/FormationControl';

import {
  throwError
} from 'formation/etc/utils';

import {
  FORM_COMPONENT_NAME,
  REGISTER_FORM_CALLBACK,
  REGISTER_NG_MODEL_CALLBACK
} from 'formation/etc/constants';


formationModule.config(($provide, FormationProvider) => {
  // Decorate "form".
  $provide.decorator('formDirective', $delegate => {
    const [ngFormDirective] = $delegate;
    const compile = ngFormDirective.compile;

    // Add the Formation form controller as an optional parent require.
    ngFormDirective.require = ngFormDirective.require.concat(`^^?${FORM_COMPONENT_NAME}`);

    ngFormDirective.compile = function () {
      // Invoke original compile to get link object.
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

          // Get a list of all controllers that are instance of the (Formation) FormController.
          const candidateControllers = controllers.filter(controller => controller instanceof FormController);

          // Ensure only one controller was found.
          if (candidateControllers.length === 1) {
            const [fmFormController] = candidateControllers;

            if (R.is(Function, fmFormController[REGISTER_FORM_CALLBACK])) {
              fmFormController[REGISTER_FORM_CALLBACK](ngFormController);
            }
          } else if (candidateControllers.length > 1) {
            throwError('Directive "form" found multiple parent controllers that are Formation forms.');
          }
        }
      };
    };

    return $delegate;
  });


  // Decorate "ngModel".
  $provide.decorator('ngModelDirective', $delegate => {
    const [ngModelDirective] = $delegate;
    const compile = ngModelDirective.compile;
    const registeredComponents = FormationProvider.getRegisteredComponents();

    // Add each registered component as an optional parent require on ngModel.
    ngModelDirective.require = ngModelDirective.require.concat(registeredComponents.map(component => {
      return `^^?${component}`;
    }));

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

          // Get a list of all parent controllers that are Formation controls.
          const candidateComponents = controllers.filter(controller => controller instanceof FormationControl);

          if (candidateComponents.length > 1) {
            throwError('Directive "ngModel" found multiple parent controllers that are Formation controls.');
          }

          // Get a list of all parent controllers that are instances of
          // Formation forms.
          const candidateForms = controllers.filter(controller => controller instanceof FormController);

          if (candidateForms.length > 1) {
            throwError('Directive "ngModel" found multiple parent controllers that are Formation forms.');
          }

          if (candidateComponents.length) {
            // If we have a parent controller that is a Formation control,
            // register with it.
            const [fmComponentController] = candidateComponents;

            if (R.is(Function, fmComponentController[REGISTER_NG_MODEL_CALLBACK])) {
              fmComponentController[REGISTER_NG_MODEL_CALLBACK](ngModelController);
            }
          } else if (candidateForms.length) {
            // Otherwise, if we have a parent controller that is a Formation
            // form, register with it. This may happen if a developer uses
            // ngModel outside of a Formation component.
            const [fmFormController] = candidateForms;

            if (R.is(Function, fmFormController[REGISTER_NG_MODEL_CALLBACK])) {
              fmFormController[REGISTER_NG_MODEL_CALLBACK](ngModelController);
            }
          }
        }
      };
    };

    return $delegate;
  });
});
