# FormationControl

**Type:** class

**Description:** Base class for all Formation controls.

----

This is the base class shared by all Formation components ([`Input`](/src/formation/components/Input), [`Select`](/src/formation/components/Select), [`Textarea`](/src/formation/components/Textarea), [`Errors`](/src/formation/components/Errors)). It can be extended to create custom components that work with Formation forms. You can use the [`getControl`](/src/formation/components/Form#getcontrolcontrolname--object) method of the Formation form controller to access individual control instnaces in the form.

## API

This class implements the following public methods:

### `getControlId() => String`

Returns the `id` attribute assigned to the control instnace.

**Returns:**

`String` - Control's `id`.

**Example:**

```js
vm.myForm.getControl('firstName').getControlId()
// => 'vm.myForm-firstName-0'
```

----

### `getControlErrors() => Object`

Returns the control's `$error` object, or `false` if the control is valid.

**Returns:**

`Object` - Control's errors.

**Example:**

```js
vm.myForm.getControl('age').getControlErrors()
// => {required: false, min: true}
```

----

### `getErrorMessages() => Array`

Returns the configured error messages for the control.

**Example:**

```js
vm.myForm.getControl('firstName').getErrorMessages()
// => [['required', 'This field is required'], ['minLength', 'Please enter at least two characters.']]

```

----

### `disable()`

Sets the control's internal `$disabled` flag to true. A control will be disabled if any of the following conditions are true:

1. It's `$disabled` flag is `true`.
2. The form's `$disabled` flag is `true`, or the form has a truthy `ngDisabled` expresssion on it.
3. The control has a truthy `ngDisabled` expression on it.

**Example:**

```js
vm.myForm.getControl('firstName').disable();
```

----

### `enable()`

Sets the control's internal `$disabled` flag to `false`. Note that the control _may_ still remain disabled if any of the above conditions are also true. It is recommended that either `ngDisabled` or the form/control APIs be used, but not both.

**Example:**

```js
vm.myForm.getControl('firstName').enable();
```

----

### `getModelValue() => *`

Return's the control's model value.

**Example:**

```js
vm.myForm.getControl('firstName').getModelValue();
// => 'Frodo'
```

----

### `setModelValue(*)`

Set's the control's model value.

**Example:**

```js
vm.myForm.getControl('age').setModelValue(42);
```
