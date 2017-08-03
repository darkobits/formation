# Formation Configuration

This module provides the `configure` and `registerControl` functions, both of which are part of the Formation package's public API.


## `configure(opts: object) => void`

Configures global Formation behavior.

**Note:** Formation components are registered during Angular's `run` phase. Therefore, configuration must be done prioer to prior to bootstrapping or during the `config` phase.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`opts`|`Object`|Configuration options.|
|`[opts.showErrorsOn]`|`String`|Comma/space-delimited string of control or form states that, when true, will cause `ngMessage` errors to display for a given control.|
|`[opts.prefix='fm']`|`String`|Overrides the default component prefix for all Formation controls.|

**Example:**

```js
import Formation, {
  configure as configureFormation
} from '@darkobits/formation';

const app = angular.module('MyApp', [
  Formation
]);

configureFormation({
  showErrorsOn: 'touched, submitted',
  prefix: 'foo'
});

app.config($fooProvider => {
  // Or, configure Formation during the config phase if you want to drive behavior using a provider.
  configureFormation({
    showErrorsOn: $fooProvider.formErrorBehavior()
  });
});
```

## `registerControl(name: string, definition: object) => void`

Registers a Formation control as an Angular component using the provided name and component definition object.

**Note:** The configured prefix (`'fm'` by default) will be prepended to the component's name.

**Note:** Formation components are registered during Angular's `run` phase. Therefore, configuration must be done prior to bootstrapping or during the `config` phase.

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`name`|`String`|Component name.|
|`definition`|`Object`|Component definition.|

**Example:**

```js
import Formation, {
  FormationControl,
  registerControl
} from '@darkobits/formation';

const app = angular.module('MyApp', [
  Formation
]);


class MyCustomControl extends FormationControl {

}

registerControl('datePicker', {
  bindings: {
    name: '@'
  },
  controller: MyCustomControl,
  controllerAs: 'MyCustomControl',
  template: `
    <input type="text"
      name="MyCustomControl.name"
      ng-model="MyCustomControl.$ngModelGetterSetter">
  `
});
```

```html
<fm name="myForm">
  <fm-date-picker format="YYYY-MM-DD"><fm-date-picker>
</fm>
```
