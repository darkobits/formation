import R from 'ramda';
import formationModule from 'formation/module';


/**
 * Key on parent controllers at which this component will expect a registration
 * method to be implemented.
 *
 * @memberOf RegisterWithParent
 * @alias RWP_CALLBACK
 *
 * @type {Symbol}
 */
export const RWP_CALLBACK = Symbol('RWP_CALLBACK');


/**
 * @class RegisterWithParent
 *
 * @description
 *
 * This directive allows parent-to-child controller communication between
 * directives that a developer may not have access to, like Angular built-ins.
 *
 * For example, suppose we are building a component that uses `ngModel`
 * somewhere in its template. We want the controller for our component to have a
 * reference to the controller for `ngModel`. Angular does not support requiring
 * child controllers, and we cannot modify the definition of `ngModel` to
 * require our parent controller.
 *
 * However, we can create an attribute directive that can require our parent
 * controller and the `ngModel` controller as a sibling. Once it has references
 * to both controllers, it can pass the child controller to the parent
 * controller via some interface; in this case, parent controllers will
 * implement a method that the directive will invoke with a reference to the
 * child controller.
 *
 * @example
 *
 * import {RWP_CALLBACK} from '...';
 *
 * app.component('parentComponent', {
 *   controller () {
 *     const $ctrl = this;
 *
 *     $ctrl[RWP_CALLBACK] = (name, ctrl) => {
 *       // We have effectively "required" a child controller!
 *       // Do something with ngModel here.
 *     };
 *   },
 *   template: `
 *     <div>
 *       <h1>My Awesome Component</h1>
 *       <input type="text"
 *         ng-model="$ctrl.someValue"
 *         register-with-parent="ngModel:parentComponent">
 *     </div>
 *    `
 * });
 */


formationModule.directive('registerWithParent', function ($log) {
  const ddo = {};

  Object.assign(ddo, {
    restrict: 'A',
    compile (tElement, tAttributes) {
      const [sibling, parent] = tAttributes.registerWithParent.split(':');

      if (sibling && parent) {
        // Modify the directive's definition during the compile phase to require
        // the necessary controllers.
        ddo.require = [sibling, `^^${parent}`];
      } else {
        throw new Error(`[RegisterWithParent] Expected format "siblingCtrl:parentCtrl" but got "${tAttributes.registerWithParent}".`); // eslint-disable-line max-len
      }

      // Clean up.
      tElement[0].removeAttribute('register-with-parent');

      return function link (scope, element, attributes, controllers) {
        const [siblingCtrl, parentCtrl] = controllers;

        if (R.is(Function, parentCtrl[RWP_CALLBACK])) {
          parentCtrl[RWP_CALLBACK](sibling, siblingCtrl);
        } else {
          $log.warn(`[RegisterWithParent] Parent controller "${parent}" does not implement a registration method.`);
        }
      };
    }
  });

  return ddo;
});
