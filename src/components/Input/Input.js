// -----------------------------------------------------------------------------
// ----- Input Component -------------------------------------------------------
// -----------------------------------------------------------------------------

import {
  registerControl
} from '../../etc/config';

import {
  NG_MODEL_CTRL
} from '../../etc/constants';

import {
  FormationControl,
} from '../../classes/FormationControl';


/**
 * This component creates an input control and a label. All valid HTML5 input
 * types are allowed. The label is transcluded.
 *
 * Note: For "radio" and "checkbox" types, the label will be
 * rendered after the control. For all other types, the label will be rendered
 * before the control.
 *
 * Implements the following bindings:
 * - `config`: Configuration object.
 * - `name`: Name of the control.
 * - `placeholder`: Control placeholder.
 * - `type`: Control type.
 * - `ng-disabled`: If truthy, will disable the control.
 * - `ng-value`: Value to assign to model value (for radio buttons).
 *
 * @module Input
 *
 * @example
 *
 * <my-form name="myForm">
 *   <my-input name="myControl"
 *     type="text"
 *     config="vm.myControlConfig">
 *     Enter some text:
 *   </my-input>
 *  </my-form>
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
      ng-model="Input.$ngModelGetterSetter"
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
