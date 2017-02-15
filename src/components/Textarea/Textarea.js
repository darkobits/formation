// -----------------------------------------------------------------------------
// ----- Textarea Component ----------------------------------------------------
// -----------------------------------------------------------------------------

import app from '../../app';

import {
  FormationControl,
  NG_MODEL_CTRL
} from '../FormationControl';


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


app.run(Formation => {
  const NAME = Formation.$getPrefixedName('Textarea');

  Formation.registerControl(NAME, {
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
          'has-error': Input.getControlErrors(),
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
          'has-error': Textarea.getControlErrors(),
          'is-pending': Textarea.${NG_MODEL_CTRL}.$pending
        }"
        ng-disabled="Textarea.$isDisabled()">
    `
  });
});
