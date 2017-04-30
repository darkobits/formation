# Formation Configuration

This module exports the `FormationConfigurator` and `registerControl` functions, both of which are part of the Formation package's public API.


## `FormationConfigurator(opts: object) => void`

Configures global Formation behavior.

**Note:** Formation uses these options during Angular's config phase, so the configurator must be invoked prior to bootstrapping (re: outside of `config` or `run` blocks).

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`opts`|`Object`|Configuration options.|
|`[opts.showErrorsOn]`|`String`|Comma/space-delimited string of control or form states that, when true, will cause `ngMessage` errors to display for a given control.|
|`[opts.prefix='fm']`|`String`|Overrides the default component prefix for all Formation controls.|

**Example:**

```js
import Formation, {
  FormationConfigurator
} from '@darkobits/formation';

const app = angular.module('MyApp', [
  Formation
]);

FormationConfigurator({
  showErrorsOn: 'touched, submitted',
  prefix: 'foo'
});

app.config(() => {
  // ...
});

app.run(() => {
  // ...
});
```

## `registerControl(name: string, definition: object) => void`

Registers a Formation control as an Angular component using the provided name and component definition object. Note: The configured prefix (`'fm'` by default) will be prepended to the component's name.

**Note:** Components will be registered during Angular's config phase, so the this function must be invoked prior to bootstrapping (re: outside of `config` or `run` blocks);

**Parameters:**

|Name|Type|Description|
|---|---|---|
|`name`|`String`|Component name.|
|`definition`|`Object`|Component definition.|

**Example:**

```js
import Formation, {
  registerControl
} from '@darkobits/formation';

const app = angular.module('MyApp', [
  Formation
]);

registerControl('datePicker', {
  // ...
});
```

```html
<fm name="myForm">
  <fm-date-picker format="YYYY-MM-DD"><fm-date-picker>
</fm>
```
