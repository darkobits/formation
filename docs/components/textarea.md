# Textarea Component

**Name:** `fmTextarea` \(Prefix Configurable\)

**Type:** [`component`](https://docs.angularjs.org/guide/component)

This component creates a `<label>` and a `<textarea>` control. The control and label will be assigned matching `id` and `for` attributes.

### Bindings

| Name | Type | Description |
| --- | --- | --- |
| `name` | `@` | Name of the control. |
| `placeholder` | `@` | Textarea placeholder. |
| `config` | `<` | Control configuration object. \(See: [Control Configuration](/packages/formation/src/classes/FormationControl#control-configuration)\) |

### API

This control extends the [`FormationControl`](/src/components/FormationControl) class, and does not implement any additional methods.

### Additional Behavior

* **Transclusion:** Transcluded content will be placed in the `<label>` created by this component.
* **CSS**
  * The class `has-error` will be applied to the `<textarea>` and `<label>` elements when the control has an error.
  * The class `is-pending` will be applied to the `<textarea>` and `<label>` elements when the control is pending.
  * Disabling: The component can be disabled/enabled in any of four ways:
    * Using `ngDisabled` on the Formation form element \(`<fm>`\).
    * Using `ngDisabled` on the component's element.
    * Using the [`disable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#disable)/[`enable`](https://github.com/darkobits/formation/tree/canary/src/components/Form#enable) methods of the Formation form API.
    * Using the [`disable`](/packages/formation/src/classes/FormationControl#disable)/[`enable`](/packages/formation/src/classes/FormationControl#enable) methods of the component API.

### Example

```html
<fm name="vm.myForm" controls="vm.controls">
  <fm-input type="email" name="email">E-Mail Address:</fm-input>
  <fm-textarea name="messageBody">Message:</fm-textarea>
</fm>
```

### Additional Resources

* [AngularJS: API: textarea](https://docs.angularjs.org/api/ng/directive/textarea)



