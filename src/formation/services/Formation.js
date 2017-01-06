// -----------------------------------------------------------------------------
// ----- Formation Service -----------------------------------------------------
// -----------------------------------------------------------------------------

import formationModule from 'formation/module';

import {
  DEFAULT_PREFIX,
  FORM_COMPONENT_NAME
} from 'formation/etc/constants';

import {
  COMPONENT_CONFIGURATION,
  FORM_CONTROLLER
} from 'formation/components/FormationControl';

import {
  capitalize,
  lowercase,
  mergeDeep
} from 'formation/etc/utils';


/**
 * @module FormationProvider
 *
 * @description
 *
 * The `Formation` provider.
 */
formationModule.provider('Formation', function ($compileProvider) {

  /**
   * @private
   *
   * Configured component prefix.
   *
   * @type {string}
   */
  var prefix = '';


  /**
   * @private
   *
   * Global setting for error behavior.
   *
   * @type {string}
   */
  var showErrorsOnStr;


  /**
   * @private
   *
   * Counter for getNextId(), used to assign unique IDs to unnamed forms.
   *
   * @type {number}
   */
  var counter = -1;


  // ----- Provider ------------------------------------------------------------

  /**
   * @alias module:FormationProvider.setPrefix
   *
   * @description
   *
   * Sets the prefix for all built-in Formation components to the provided
   * value. If not configured, built-in components will use the prefix `fm`.
   *
   * @example
   *
   * app.config(FormationProvider => {
   *   FormationProvider.setPrefix('foo');
   * });
   *
   * // =>
   *
   * <fm name="fooForm">
   *   <foo-input name="foo">Foo Label</foo-input>
   * </fm>
   *
   * @param  {string} newPrefix
   */
  this.setPrefix = newPrefix => {
    prefix = String(newPrefix);
  };


  /**
   * @alias module:FormationProvider.showErrorsOn
   *
   * @description
   *
   * Sets the global default for when to show control errors. This behavior can
   * also be configured on a per-form basis using the `show-errors-on`
   * attribute. For consistency, it is recommended that this setting be
   * configured globally.
   *
   * @example
   *
   * app.config(FormationProvider => {
   *   FormationProvider.showErrorsOn('touched, submitted');
   * });
   *
   * @param  {sting} flags - Comma/space-delimited string of flags.
   */
  this.showErrorsOn = flags => {
    showErrorsOnStr = flags;
  };


  // ----- Service -------------------------------------------------------------

  /**
   * @module FormationService
   *
   * @description
   *
   * The `Formation` service.
   */
  this.$get = () => {

    /**
     * @alias module:FormationService#getNextId
     * @private
     *
     * @description
     *
     * Returns the next available ID, used for assigning ID attributes to
     * unnamed form instances.
     *
     * @example
     *
     * Formation.getNextId() // => 4
     *
     * @return {number}
     */
    function $getNextId () {
      return ++counter;
    }


    /**
     * @alias module:FormationService#getShowErrorsOnStr
     * @private
     *
     * @description
     *
     * Returns globally-configured error flags.
     *
     * @return {string}
     */
    function $getShowErrorsOnStr () {
      return showErrorsOnStr;
    }


    /**
     * @alias module:FormationService#getPrefixedName
     * @private
     *
     * @description
     *
     * Returns a prefixed version of the provided string.
     *
     * @example
     *
     * Formation.$getPrefixedName('Input') // => 'xInput';
     *
     * @param  {string} name
     * @return {string}
     */
    function $getPrefixedName (name) {
      return `${prefix || DEFAULT_PREFIX}${capitalize(name)}`;
    }


    /**
     * @alias module:FormationService#registerComponent
     * @private
     *
     * @description
     *
     * Allows components to be registered dynamically at runtime.
     *
     * @example
     *
     * Formation.$registerComponent('xInput', {
     *   ...
     * });
     *
     * @param  {string} name - Component name.
     * @param  {object} definition - Component definition object.
     */
    function $registerComponent (name, definition) {
      $compileProvider.component(lowercase(name), definition);
    }


    /**
     * @alias module:FormationService#registerDirective
     * @private
     *
     * @description
     *
     * Allows directives to be registered dynamically at runtime.
     *
     * @example
     *
     * Formation.$registerDirective('xInput', () => {
     *   return {
     *     // DDO
     *   }
     * });
     *
     * @param  {string} name - Directive name.
     * @param  {function} directiveFn - Directive factory function.
     */
    function $registerDirective (name, directiveFn) {
      $compileProvider.directive(lowercase(name), directiveFn);
    }


    /**
     * @alias module:FormationService#registerControl
     *
     * @description
     *
     * Registers an Angular component as a Formation control using the base
     * component definition object, ensuring the minimum necessary `bindings`
     * and `required` attributes are defined. It is recommended this function be
     * called from a `run()` block.
     *
     * @example
     *
     * import FormationControl from 'formation/components/FormationControl';
     *
     * class DatePicker extends FormationControl {
     *   // ...
     * }
     *
     * app.run(Formation => {
     *   Formation.registerControl('datePicker', {
     *     controllerAs: 'DatePicker',
     *     controller: DatePicker,
     *     template: // ...
     *   });
     * });
     *
     * This component could then be used as:
     *
     * <fm name="vm.myForm">
     *   <fm-date-picker name="date"></fm-date-picker>
     * </fm>
     *
     * @param  {string} name - Component name.
     * @param  {object} definition - Component definition object.
     */
    function registerControl (name, definition) {
      $registerComponent(name, mergeDeep({
        bindings: {
          [COMPONENT_CONFIGURATION]: '<config',
          $ngDisabled: '<ngDisabled'
        },
        require: {
          [FORM_CONTROLLER]: `^^${FORM_COMPONENT_NAME}`
        }
      }, definition));
    }


    return {
      $getNextId,
      $getShowErrorsOnStr,
      $getPrefixedName,
      $registerComponent,
      $registerDirective,
      registerControl
    };
  };
});
