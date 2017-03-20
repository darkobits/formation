import R from 'ramda';
import app from '../app';

import FormController from '../components/Form/Form';

import {
  FormationControl
} from '../components/FormationControl';

import {
  FORM_COMPONENT_NAME,
  REGISTER_FORM_CALLBACK,
  REGISTER_NG_MODEL_CALLBACK
} from './constants';


app.config(($provide, FormationProvider) => {
  // Decorate ngForm.
  $provide.decorator('formDirective', $delegate => {
    const [ngFormDirective] = $delegate;
    const compile = ngFormDirective.compile;

    // Add the Formation form controller as an optional parent require.
    ngFormDirective.require = ngFormDirective.require.concat(`^?${FORM_COMPONENT_NAME}`);

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

          if (fmFormController && R.is(Function, fmFormController[REGISTER_FORM_CALLBACK])) {
            fmFormController[REGISTER_FORM_CALLBACK](ngFormController);
          }
        }
      };
    };

    return $delegate;
  });


  // Decorate ngModel.
  $provide.decorator('ngModelDirective', $delegate => {
    const [ngModelDirective] = $delegate;
    const compile = ngModelDirective.compile;
    const registeredComponents = FormationProvider.$getRegisteredComponents();

    // Add each registered component as an optional parent require on ngModel.
    ngModelDirective.require = R.concat(
      ngModelDirective.require,
      R.map(component => `^^?${component}`, registeredComponents)
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

          if (fmComponentController && R.is(Function, fmComponentController[REGISTER_NG_MODEL_CALLBACK])) {
            // If we are the child of a Formation control, register with the
            // control.
            fmComponentController[REGISTER_NG_MODEL_CALLBACK](ngModelController);
          } else if (fmFormController && R.is(Function, fmFormController[REGISTER_NG_MODEL_CALLBACK])) {
            // Otherwise, if we are the child of a Formation form, register with
            // the form.a
            fmFormController[REGISTER_NG_MODEL_CALLBACK](ngModelController);
          }
        }
      };
    };

    return $delegate;
  });
});
