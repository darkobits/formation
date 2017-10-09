import FormationControl from 'classes/FormationControl';
import {registerControl} from 'etc/config';
import {CUSTOM_ERROR_KEY} from 'etc/constants';


registerControl('Errors', {
  bindings: {
    for: '@'
  },
  controller: FormationControl,
  controllerAs: 'Errors',
  template: `
    <label for="{{::Errors.$getCanonicalControlId() }}"
      ng-if="Errors.getErrors()"
      ng-class="{
        'is-disabled': Errors.isDisabled()
      }"
      ng-messages="Errors.getErrors()"
      role="alert">
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
