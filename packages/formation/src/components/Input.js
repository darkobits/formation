import FormationControl from 'classes/FormationControl';
import {registerControl} from 'etc/config';

import {
  NG_MODEL_CTRL,
  NG_MODEL_GETTER_SETTER
} from 'etc/constants';


registerControl('Input', {
  bindings: {
    name: '@',
    type: '@',
    ngValue: '<'
  },
  transclude: true,
  controller: FormationControl,
  controllerAs: 'Input',
  template: `
    <label for="{{::Input.getControlId() }}"
      ng-if="Input.type !== 'radio' && Input.type !== 'checkbox'"
      ng-class="{
        'has-error': Input.getErrors(),
        'is-pending': Input.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Input.isDisabled()
      }"
      ng-transclude>
    </label>
    <input id="{{::Input.getControlId() }}"
      name="{{::Input.$getNameAttribute() }}"
      ng-model="Input.${NG_MODEL_GETTER_SETTER}"
      ng-value="Input.ngValue"
      ng-class="{
        'has-error': Input.getErrors(),
        'is-pending': Input.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Input.isDisabled()
      }"
      ng-disabled="Input.isDisabled()"
      aria-required="{{::Input.$isRequired() ? 'true' : 'false' }}"
      aria-invalid="{{ Input.$invalid ? 'true' : 'false' }}">
    <label for="{{::Input.getControlId() }}"
      ng-if="Input.type === 'radio' || Input.type === 'checkbox'"
      ng-class="{
        'has-error': Input.getErrors(),
        'is-pending': Input.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Input.isDisabled()
      }"
      ng-transclude>
    </label>
  `
});
