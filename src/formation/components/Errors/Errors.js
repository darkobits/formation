// -----------------------------------------------------------------------------
// ----- Errors Component ------------------------------------------------------
// -----------------------------------------------------------------------------

import formationModule from 'formation/module';

import {
  FormationControl
} from 'formation/components/FormationControl';

import {
  CUSTOM_ERROR_KEY
} from 'formation/etc/constants';


/**
 * This component is responsible for displaying errors related to a control.
 *
 * It implements the following bindings:
 *
 * - `for`: Control name to show errors for.
 *
 * @module Errors
 *
 * @example
 *
 * <my-form name="myForm">
 *   <my-input name="myControl"
 *     type="text">
 *     Enter some text:
 *   </my-input>
 *   <my-errors for="myControl"></my-errors>
 *  </my-form>
 */


class Errors extends FormationControl {
  constructor () {
    super();
  }
}


formationModule.run(Formation => {
  const NAME = Formation.$getPrefixedName('Errors');

  Formation.registerControl(NAME, {
    bindings: {
      for: '@'
    },
    controller: Errors,
    controllerAs: 'Errors',
    template: `
      <label for="{{::Errors.$getCanonicalControlId() }}"
        ng-if="Errors.getControlErrors()"
        ng-messages="Errors.getControlErrors()">
        <span ng-repeat="error in Errors.getErrorMessages()"
          ng-message="{{::error[0] }}">
          {{::error[1] }}
        </span>
        <span ng-message="${CUSTOM_ERROR_KEY}">
          {{ Errors.getCustomErrorMessage() }}
        </span>
      </label>
    `
  });
});
