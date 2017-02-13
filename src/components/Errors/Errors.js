// -----------------------------------------------------------------------------
// ----- Errors Component ------------------------------------------------------
// -----------------------------------------------------------------------------

import app from '../../app';

import {
  FormationControl
} from '../FormationControl';

import {
  CUSTOM_ERROR_KEY
} from '../../etc/constants';


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
 * <fm name="myForm">
 *   <fm-input name="myControl"
 *     type="text">
 *     Enter some text:
 *   </fm-input>
 *   <fm-errors for="myControl"></fm-errors>
 *  </fm-form>
 */


class Errors extends FormationControl {
  constructor () {
    super();
  }
}


app.run(Formation => {
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
