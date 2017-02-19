# Formation

**Type:** [`service`](https://docs.angularjs.org/guide/services)

## Description

This service allows developers to configure certain global Formation behaviors, and to register custom controls with Formation.

## Provider API

### `setPrefix(prefix)`

Sets the prefix for all built-in Formation components to the provided value. If not configured, built-in components will use the prefix `fm`.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`prefix`|`String`|Prefix to use.|

**Example:**

```js
app.config(FormationProvider => {
  FormationProvider.setPrefix('foo');
});
```

----

### `showErrorsOn(flags)`

Sets the global default for when to show control errors. This behavior can also be configured on a per-form basis using the `show-errors-on` attribute on the `<fm>` component. For consistency, however, it is recommended that this setting be configured globally.

Formation will use the following algorithm to determine if a control should be showing error messages:

1. Check if the control is `$valid`. If so, bail.
2. Check if the control has any of the configured flags, and if they are `true`. If so, show errors for the control.
3. Check if the form has any of the configured flags, and if they are `true`. If so, show errors for the control.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`flags`|`String`|Comma/space-delimited string of flags.|

**Example:**

```js
app.config(FormationProvider => {
  // Show errors when a control has been $touched, or when the form has been $submitted.
  FormationProvider.showErrorsOn('touched, submitted');
});
```

## Service API

### `registerControl(name, definition)`

Registers an Angular component as a Formation control using the base component definition object, ensuring the minimum necessary `bindings` and `required` attributes are defined. It is recommended this function be called from a `run()` block.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`name`|`String`|Name of the component.|
|`definition`|`Object`|[Component](https://docs.angularjs.org/guide/component) definition object.|

**Example:**

```js
// A reference to our angular.module.
import app from 'app';
import FormationControl from '@darkobits/formation/components/FormationControl';

class DatePicker extends FormationControl {
  // ...
}

app.run(Formation => {
  Formation.registerControl('datePicker', {
    controllerAs: 'DatePicker',
    controller: DatePicker,
    template: // ...
  });
});
```

This component could then be used thusly:

```html
<fm name="vm.myForm">
  <fm-date-picker name="date"></fm-date-picker>
</fm>
```
