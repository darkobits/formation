# Select Component

**Name:** `fmSelect` (Prefix Configurable)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

**Description:** Creates a `<label>` and a `<select>` control.

**Bindings:**

|Name|Type|Description|
|---|---|---|
|`name`|`@`|Name of the control.|
|`placeholder`|`@`|Input placeholder (will be rendered as a null option).|
|`multiple`|`@`|Whether to render a single select or a multi-select.|
|`options`|`@`|Comprehension expression to pass to `ngOptions`.|

**Transclusion:**

Transcluded content will be placed in the `<label>` created by this component.

----

This component creates a label and a select control. The control and label will be assigned matching `id` and `for` attributes.

## Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-select name="birthYear" options="year in vm.years">What year were you born in?</fm-input>
</fm>
```

## API

This control extends the [`FormationControl`](/src/formation/components/FormationControl) class, and does not implement any additional methods.
