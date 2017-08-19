# Registering Custom Components

Formation is designed to be extensible. One way to extend Formation is by creating custom controls.

To create a custom control for use with Formation, import the `FormationControl` class \(upon which all built-in Formation controls are also based\) and the `registerControl` method from the Formation package. Define a component whose class `extends` the `FormationControl` class, then provide a name and definition object to `registerControl`, just as you would to Angular's `component` method.

If your component uses `ngModel`, ensure its `ngModel` expression is set to `$ctrl.$ngModelGetterSetter` \(substituting `$ctrl` for the component's `controllerAs` alias, if it uses one\) to ensure its model values are correctly synced with Formation.

For a reference implementation, see [`Input.js`](https://github.com/darkobits/formation/blob/master/packages/formation/src/components/Input/Input.js) in the Formation repository.

### `registerControl(name: string, definition: object): void`

Registers a Formation control as an Angular component using the provided name and component definition object.

> **Note:** The configured prefix \(`'fm'` by default\) will be prepended to the component's name.
>
> **Note:** Formation components are registered during Angular's `run` phase. Therefore, configuration must be done prior to bootstrapping or during the `config` phase.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `name` | `String` | Component name. |
| `definition` | `Object` | Component definition. |

#### **Example**

```js
// datePicker.js
import {
  FormationControl,
  registerControl
} from '@darkobits/formation';

import {
  date
} from 'myValidators';

class DatePicker extends FormationControl {
  constructor () {
    super();

    this.configure({
      // Configure the control via FormationControl#configure.
      validators: {
        date
      }
    });
  }


  openDatePickerPane () {
    // ...
  }
}

registerControl('datePicker', {
  bindings: {
    name: '@'
  },
  controller: MyCustomControl,
  controllerAs: 'DatePicker',
  template: `
    <input type="date"
      name="{{ DatePicker.name }}"
      ng-model="DatePicker.$ngModelGetterSetter"
      ng-click="DatePicker.openDatePickerPane()">
  `
});
```

```html
<fm name="myForm">
  <fm-date-picker name="date"><fm-date-picker>
</fm>
```

> **Note: **You can also pass a function to `registerControl` that should return a directive definition object. However, when using `registerControl` in this way, Formation will not automatically add the necessary `bindings` and `require` properties required for controls to work with Formation forms.



