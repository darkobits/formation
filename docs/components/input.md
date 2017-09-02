# Input Component

**Name:** `fmInput` \(Prefix Configurable\)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

This component creates a label and an input control. It supports any [valid HTML5 input type](http://www.w3schools.com/html/html_form_input_types.asp). The control and label will be assigned matching `id` and `for` attributes. When `type` is set to `radio` or `checkbox`, the label will be placed after the control. Otherwise, it will be placed before the control.

### Bindings

| Name | Type | Description |
| --- | --- | --- |
| `name` | `@` | Name of the control. |
| `placeholder` | `@` | Input placeholder \(if applicable\). |
| `type` | `@` | Input type \(`text`, `radio`, `checkbox`, etc\). |
| `ng-value` | `<` | Value to set the control's model to when selected \(for radios\). |
| `config` | `<` | Control configuration object. \(See: [Control Configuration](/packages/formation/src/components/FormationControl#control-configuration)\) |
| `ng-disabled` | `<` | Expression to evaluate to determine if the component should be disabled. (Passed-through to the underlying `<input>` element.) |

### API

This control extends the [`FormationControl`](/packages/formation/src/classes/FormationControl) class, and does not implement any additional methods.

### Additional Behavior

* Transclusion: Transcluded content will be placed in the `<label>` created by this component.
* CSS
  * The class `has-error` will be applied to the `<input>` and `<label>` elements when the control has an error.
  * The class `is-pending` will be applied to the `<input>` and `<label>` elements when the control is pending.
* Disabling: The component can be disabled/enabled in any of four ways:
  * Using `ngDisabled` on the Formation form element \(`<fm>`\).
  * Using `ngDisabled` on the component's element.
  * Using the [`disable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#disable)/[`enable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#enable) methods of the Formation form API.
  * Using the [`disable`](/packages/formation/src/classes/FormationControl#disable)/[`enable`](/packages/formation/src/classes/FormationControl#enable) methods of the component API.

### Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName" type="text">First Name:</fm-input>
  <fm-input name="lastName" type="text">Last Name:</fm-input>

  <fieldset>
    <legend>What is your favorite color?</legend>
    <fm-input name="favoriteColor" type="radio" ng-value="red">Red</fm-input>
    <fm-input name="favoriteColor" type="radio" ng-value="green">Green</fm-input>
    <fm-input name="favoriteColor" type="radio" ng-value="blue">Blue</fm-input>
  </fieldset>
</fm>
```

### Additional Resources

* [AngularJS: API: input](https://docs.angularjs.org/api/ng/directive/input)



