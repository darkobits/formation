// -----------------------------------------------------------------------------
// ----- Select Component ------------------------------------------------------
// -----------------------------------------------------------------------------

import {
  $getPrefixedName,
  $registerComponent
} from '../../etc/config';

import {
  COMPONENT_CONFIGURATION,
  FORM_COMPONENT_NAME,
  FORM_CONTROLLER,
  NG_MODEL_CTRL,
  NG_MODEL_GETTER_SETTER
} from '../../etc/constants';

import {
  FormationControl
} from '../../classes/FormationControl';


/**
 * This component creates a select control and a label. Use "options" rather
 * than "ng-options". Supports "multiple". The label is transcluded.
 *
 * This component needs to be a directive for two reasons:
 * 1. In order to support traditional ngOptions behavior, the component needs to
 *    inherit the parent scope.
 * 2. ngOptions needs to be set on the select element during compilation,
 *    requiring a compile function.
 */
class SelectControl extends FormationControl {

}


// Since we're registering a directive, we need to use the private
// $registerComponent function, which requires that we manually prefix the name.
$registerComponent($getPrefixedName('Select'), () => {
  return {
    restrict: 'E',
    scope: true,
    bindToController: {
      [COMPONENT_CONFIGURATION]: '<config',
      name: '@',
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
          'is-pending': Select.${NG_MODEL_CTRL}.$pending,
          'is-disabled': Select.isDisabled()
        }"
        ng-transclude>
      </label>
      <select id="{{::Select.getControlId() }}"
        name="{{::Select.name }}"
        ng-model="Select.${NG_MODEL_GETTER_SETTER}"
        ng-if="::!Select.multiple"
        ng-disabled="Select.isDisabled()"
        ng-class="{
          'has-error': Select.getErrors(),
          'is-pending': Select.${NG_MODEL_CTRL}.$pending,
          'is-disabled': Select.isDisabled()
        }"
        aria-required="{{::Select.$isRequired() }}">
        <option value=""
          ng-if="::Select.placeholder"
          hidden>
          {{::Select.placeholder }}
        </option>
      </select>
      <select id="{{::Select.getControlId() }}"
        name="{{::Select.name }}"
        ng-model="Select.${NG_MODEL_GETTER_SETTER}"
        ng-if="::Select.multiple"
        ng-disabled="Select.isDisabled()"
        ng-class="{
          'has-error': Select.getErrors(),
          'is-pending': Select.${NG_MODEL_CTRL}.$pending,
          'is-disabled': Select.isDisabled()
        }"
        multiple>
      </select>
    `
  };
});
