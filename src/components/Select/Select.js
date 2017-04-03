// -----------------------------------------------------------------------------
// ----- Select Component ------------------------------------------------------
// -----------------------------------------------------------------------------

import app from '../../app';

import {
  FORM_COMPONENT_NAME
} from '../../etc/constants';

import {
  FormationControl,
  COMPONENT_CONFIGURATION,
  FORM_CONTROLLER,
  NG_MODEL_CTRL
} from '../FormationControl';


/**
 * This component creates a select control and a label. Use "options" rather
 * than "ng-options". Supports "multiple". The label is transcluded.
 *
 * Implements the following bindings:
 * - `config`: Configuration object.
 * - `name`: Name of the control.
 * - `placeholder`: Control placeholder, implemented as a null option.
 * - `multiple`: If this attribute is present, renders a multi-select element.
 * - `ng-disabled`: If truthy, will disable the control.
 *
 * This component needs to be a directive for two reasons:
 * 1. In order to support traditional ngOptions behavior, the component needs to
 *    inherit the parent scope.
 * 2. ngOptions needs to be set on the select element during compilation,
 *    requiring a compile function.
 *
 * @module Select
 *
 * @example
 *
 * <my-form name="myForm">
 *   <my-select name="myControl"
 *     config="vm.mySelectConfig"
 *     options="i.label as i.value for vm.myOptions">
 *     Select an item:
 *   </my-select>
 *  </my-form>
 */
class SelectControl extends FormationControl {

}


app.run(Formation => {
  const NAME = Formation.$getPrefixedName('Select');

  Formation.$registerDirective(NAME, () => {
    return {
      restrict: 'E',
      scope: true,
      bindToController: {
        [COMPONENT_CONFIGURATION]: '<config',
        name: '@',
        placeholder: '@',
        multiple: '@',
        $ngDisabled: '<ngDisabled'
      },
      require: {
        [FORM_CONTROLLER]: `^^${FORM_COMPONENT_NAME}`
      },
      transclude: true,
      compile (tElement, tAttributes) {
        // We need to set ngOptions during compilation, or Angular will not use
        // them.
        tElement.find('select').attr('ng-options', tAttributes.options);
      },
      controller: SelectControl,
      controllerAs: 'Select',
      template: `
        <label for="{{::Select.getControlId() }}"
          ng-class="{
            'has-error': Select.getErrors(),
            'is-pending': Select.${NG_MODEL_CTRL}.$pending
          }"
          ng-transclude>
        </label>
        <select id="{{::Select.getControlId() }}"
          name="{{::Select.name }}"
          ng-model="Select.$ngModelGetterSetter"
          ng-if="::!Select.multiple"
          ng-disabled="Select.$isDisabled()"
          ng-class="{
            'has-error': Select.getErrors(),
            'is-pending': Select.${NG_MODEL_CTRL}.$pending
          }">
          <option value=""
            ng-if="::Select.placeholder"
            hidden>
            {{::Select.placeholder }}
          </option>
        </select>
        <select id="{{::Select.getControlId() }}"
          name="{{::Select.name }}"
          ng-model="Select.$ngModelGetterSetter"
          ng-if="::Select.multiple"
          ng-disabled="Select.$isDisabled()"
          ng-class="{
            'has-error': Select.getErrors(),
            'is-pending': Select.${NG_MODEL_CTRL}.$pending
          }"
          multiple>
        </select>
      `
    };
  });
});
