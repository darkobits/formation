# Input Component

**Name:** `fmInput` (Prefix Configurable)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Creates a `<label>` and an `<input>` control.

**Bindings:**

|Name|Type|Description|
|---|---|---|
|`name`|`@`|Name of the control.|
|`placeholder`|`@`|Input placeholder (if applicable).|
|`type`|`@`|Input type (`text`, `radio`, `checkbox`, etc).|
|`ngValue`|`<`|Value to set the control's model to when selected (for radios).|

**Transclusion:**

Transcluded content will be placed in the `<label>` created by this component.

----

This component creates a label and an input control. It supports any [valid HTML5 input type](http://www.w3schools.com/html/html_form_input_types.asp). The control and label will be assigned matching `id` and `for` attributes. When `type` is set to `radio` or `checkbox`, the label will be placed after the control. Otherwise, it will be placed before the control.

## Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input name="firstName" type="text">First Name:</fm-input>
  <fm-input name="lastName" type="text">Last Name:</fm-input>

  <label>What is your favorite color?</label>
  <fm-input name="favoriteColor" type="radio" ng-value="red">Red</fm-input>
  <fm-input name="favoriteColor" type="radio" ng-value="green">Green</fm-input>
  <fm-input name="favoriteColor" type="radio" ng-value="blue">Blue</fm-input>
</fm>
```

## API

This control extends the [`FormationControl`](/src/formation/components/FormationControl) class, and does not implement any additional methods.
