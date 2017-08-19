# Select Component

**Name:** `fmSelect` \(Prefix Configurable\)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

This component creates a `<label>` and a `<select>` control. The control and label will be assigned matching `id` and `for` attributes.

### Bindings

| Name | Type | Description |
| --- | --- | --- |
| `name` | `@` | Name of the control. |
| `placeholder` | `@` | Input placeholder \(will be rendered as a null option\). |
| `multiple` | `@` | Whether to render a single select or a multi-select. |
| `options` | `@` | Comprehension expression to pass to `ngOptions`. |
| `config` | `<` | Control configuration object. \(See: [Control Configuration](/packages/formation/src/classes/FormationControl#control-configuration)\) |

### API

This control extends the [`FormationControl`](/packages/formation/src/classes/FormationControl) class, and does not implement any additional methods.

### Additional Behavior

* Transclusion: Transcluded content will be placed in the `<label>` created by this component.
* CSS
  * The class `has-error` will be applied to the `<select>` and `<label>` elements when the control has an error.
  * The class `is-pending` will be applied to the `<select>` and `<label>` elements when the control is pending.
  * Disabling: The component can be disabled/enabled in any of four ways:
    * Using `ngDisabled` on the Formation form element \(`<fm>`\).
    * Using `ngDisabled` on the component's element.
    * Using the [`disable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#disable)/[`enable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#enable) methods of the Formation form API.
    * Using the [`disable`](/packages/formation/src/classes/FormationControl#disable)/[`enable`](/packages/formation/src/classes/FormationControl#enable) methods of the component API.

### Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-select name="birthYear" options="year in vm.years">What year were you born in?</fm-select>
</fm>
```

### Additional Resources

* [AngularJS: API: select](https://docs.angularjs.org/api/ng/directive/select)



