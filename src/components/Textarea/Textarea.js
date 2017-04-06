// -----------------------------------------------------------------------------
// ----- Textarea Component ----------------------------------------------------
// -----------------------------------------------------------------------------

import {
  registerControl
} from '../../etc/config';

import {
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  FormationControl
} from '../../classes/FormationControl';


/**
 * This component creates a textarea control and a label. The label is
 * transcluded.
 *
 *  Implements the following bindings:
 * - `config`: Configuration object.
 * - `name`: Name of the control.
 * - `placeholder`: Control placeholder, implemented as a null option.
 * - `ng-disabled`: If truthy, will disable the control.
 *
 * @module Textarea
 *
 * @example
 *
 * <my-form name="myForm">
 *   <my-textarea name="myTextarea"
 *     config="vm.myTextareaConfig">
 *     Enter some text:
 *   </my-textarea>
 *  </my-form>
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
        'is-pending': Input.${NG_MODEL_CTRL}.$pending
      }"
      ng-transclude>
    </label>
    <textarea id="{{::Textarea.getControlId() }}"
      type="{{::Textarea.type }}"
      name="{{::Textarea.name }}"
      placeholder="{{::Textarea.placeholder }}"
      ng-model="Textarea.$ngModelGetterSetter"
      ng-class="{
        'has-error': Textarea.getErrors(),
        'is-pending': Textarea.${NG_MODEL_CTRL}.$pending
      }"
      ng-disabled="Textarea.$isDisabled()">
  `
});
