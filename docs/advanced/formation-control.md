# Formation Control

**Type:** `class`

This class is inherited by all Formation component controllers. It is part of the Formation public API and can be extended to create custom components that work with Formation forms.

You can use the `getControl` method of any Formation form to access individual control instances \(re: this API\) in a form. The expression `vm.formationForm` in this document refers to a Formation form instance.

### API

### `getControlId(): string`

Returns the `id` attribute assigned to the control instnace.

#### **Returns**

`String` - Control's `id` attribute.

#### **Example**

```js
vm.formationForm.getControl('firstName').getControlId();
// => 'vm.myForm-firstName-0'
```

---

### `getErrors(): object | boolean`

Returns the control's `$error` object, or `false` if the control is valid.

#### **Returns**

`object|boolean` - The `ngModel` controller's `$error` object for the control.

#### **Example**

```js
vm.formationForm.getControl('age').getErrors();
// => {required: false, min: true}
```

---

### `getErrorMessages(): array`

Returns the configured ngMessage error messages for the control.

#### **Returns**

`array` - List of key/message pairs for the control.

#### **Example**

```js
vm.formationForm.getControl('firstName').getErrorMessages();
// => [['required', 'This field is required'], ['minLength', 'Please enter at least two characters.']]
```

---

### `isDisabled(): boolean`

Returns `true` if the control is disabled.

#### **Example**

```js
vm.formationForm.getControl('firstName').isDisabled();
// => true
```

---

### `enable(): void`

Sets the control's internal `$disabled` flag to `false`. Note that the control _may_ still remain disabled if any of the above conditions are also true. It is recommended that either `ngDisabled` or the form/control APIs be used, but not both.

#### **Example**

```js
vm.formationForm.getControl('firstName').enable();
```

---

### `disable(): void`

Sets the control's internal `$disabled` flag to true. A control will be disabled if any of the following conditions are true:

1. It's `$disabled` flag is `true`.
2. It has a truthy `ngDisabled` expression on it.
3. The form's `$disabled` flag is `true`, set using [`Form#disable`](/packages/formation/src/components/Form#disable)
4. The form has a truthy `ngDisabled` expresssion on it.

#### **Example**

```js
vm.formationForm.getControl('firstName').disable();
```

---

### `getModelValue(): any`

Return's the control's model value.

#### **Example**

```js
vm.formationForm.getControl('firstName').getModelValue();
// => 'Frodo'
```

---

### `setModelValue(modelValue: any): void`

Set's the control's model value.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `modelValue` | `Any` | Model value to set for the control. |

#### **Example**

```js
vm.formationForm.getControl('age').setModelValue(42);
```

### Additional Resources

* [AngularJS: API: ngModel.ngModelController](http://docs.angularjs.org/api/ng/type/ngModel.NgModelController)
* [AngularJS: API: ngMessages](http://docs.angularjs.org/api/ngMessages/directive/ngMessages)



