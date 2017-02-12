# Textarea Component

**Name:** `fmTextarea` (Prefix Configurable)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Creates a `<label>` and a `<textarea>` control.

**Bindings:**

|Name|Type|Description|
|---|---|---|
|`name`|`@`|Name of the control.|
|`placeholder`|`@`|Textarea placeholder.|

**Transclusion:**

Transcluded content will be placed in the `<label>` created by this component.

----

This component creates a label and a textarea control. The control and label will be assigned matching `id` and `for` attributes.

## Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input type="email" name="email">E-Mail Address:</fm-input>
  <fm-textarea name="messageBody">Message:</fm-textarea>
</fm>
```

## API

This control extends the [`FormationControl`](/src/formation/components/FormationControl) class, and does not implement any additional methods.
