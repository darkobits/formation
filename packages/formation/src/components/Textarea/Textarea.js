// -----------------------------------------------------------------------------
// ----- Textarea Component ----------------------------------------------------
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
 * This component creates a textarea control and a label. The label is
 * transcluded.
 */
class TextareaControl extends FormationControl {

}


registerControl('Textarea', {
  bindings: {
    name: '@',
    placeholder: '@'
  },
  transclude: true,
  controller: TextareaControl,
  controllerAs: 'Textarea',
  template: `
    <label for="{{::Textarea.getControlId() }}"
      ng-class="{
        'has-error': Input.getErrors(),
        'is-pending': Input.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Textarea.isDisabled()
      }"
      ng-transclude>
    </label>
    <textarea id="{{::Textarea.getControlId() }}"
      type="{{::Textarea.type }}"
      name="{{::Textarea.name }}"
      placeholder="{{::Textarea.placeholder }}"
      ng-model="Textarea.${NG_MODEL_GETTER_SETTER}"
      ng-class="{
        'has-error': Textarea.getErrors(),
        'is-pending': Textarea.${NG_MODEL_CTRL}.$pending,
        'is-disabled': Textarea.isDisabled()
      }"
      ng-disabled="Textarea.isDisabled()"
      aria-required="{{::Textarea.$isRequired() }}">
  `
});
