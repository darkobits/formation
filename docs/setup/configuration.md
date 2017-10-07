# Global Configuration

Application-wide behaviors can be set up by importing the `configure` function from the Formation package.

### `configure(options: object): void`

Configures global Formation behavior.

> **Note:** Formation components are registered during Angular's `run` phase. Therefore, configuration must be done prior to bootstrapping, or during the `config` phase.

#### **Parameters**

| Name | Type | Description |
| --- | --- | --- |
| `options` | `Object` | Configuration options. |
| `[options.showErrorsOn]` | `String` | _\(Optional\)_ Comma/space-delimited string of control or form states that, when true, will cause `ngMessage` errors to display for an invalid control. Possible values are: `pristine`, `dirty`, `submitted`, `untouched`, and `touched`. |
| `[options.prefix='fm']` | `String` | _\(Optional\)_ Overrides the default component name prefix for all Formation controls. |

#### **Example**

> `app.js`

```js
import angular from 'angular';

import Formation, {
  configure as configureFormation
} from '@darkobits/formation';

const app = angular.module('MyApp', [
  Formation
]);

// [1] Configure Formation statically.
configureFormation({
  showErrorsOn: 'touched, submitted',
  prefix: 'foo'
});

// [2] Or, configure Formation during the config phase
// if you want to drive behavior using a provider.
app.config(fooProvider => {
  configureFormation({
    showErrorsOn: fooProvider.formErrorBehavior()
  });
});

// [3] This will throw an error.
app.run(foo => {
  configureFormation({
    showErrorsOn: foo.getRuntimeErrorBehavior()
  });
});

export default app;
```



