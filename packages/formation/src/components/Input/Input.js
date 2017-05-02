// -----------------------------------------------------------------------------
// ----- Input Component -------------------------------------------------------
// -----------------------------------------------------------------------------

import {
  registerControl
} from '../../etc/config';

import {
  NG_MODEL_CTRL,
  NG_MODEL_GETTER_SETTER
} from '../../etc/constants';

import {
  FormationControl
} from '../../classes/FormationControl';


/**
 * This component creates an input control and a label. All valid HTML5 input
 * types are allowed. The label is transcluded.
 */
class InputControl extends FormationControl {

}


registerControl('Input', {
  bindings: {
    name: '@',
    placeholder: '@',
    type: '@',
    ngValue: '<'
  },
  transclude: true,
  controller: InputControl,
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
      type="{{::Input.type }}"
      name="{{::Input.type === 'radio' ? Input.$getFormName() + '-' + Input.name : Input.name }}"
      placeholder="{{::Input.placeholder }}"
      ng-model="Input.${NG_MODEL_GETTER_SETTER}"
      ng-value="Input.ngValue"
      ng-class="{
        'has-error': Input.getErrors(),
        'is-pending': Input.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Input.isDisabled()
      }"
      ng-disabled="Input.isDisabled()">
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
