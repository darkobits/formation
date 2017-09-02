# Preface

Formation is a form framework for Angular 1.5+ designed for medium-to-large applications that require consistent, robust forms. It aims to reduce template size by moving business logic to controllers, which encourages code-reuse and improves consistency.

#### Feature Overview

* Controls are configured using Plain Old JavaScript Objects rather than directives. Configuration definitions can be shared across an application or abstracted into custom components. \(See: [Form & Control Configuration](/setup/form-and-control-configuration.md)\)
* Model values are managed by the form and passed to the form's submit handler, completely eliminating the need to bind model values to a scope. \(See: [Working With Model Values](/concepts/working-with-model-values.md)\)
* A form's submit handler will only be called when it _should_ be, eliminating the need for repititious checks for `form.$valid`. \(See: [Submitting](/concepts/submitting.md)\)
* Using `ngMessages` for validation has been greatly simplified; error messages are defined in code, reducing template bloat, eliminating the need to bind error messages to a scope, and making it easier to share common messages across an application.
* Easily assign custom error messages on form controls at runtime \(from your API, for example\). \(See: [Errors](/components/errors.md)\)
* Configuring when to display validation errors can be done application-wide _or_ for each form, and is as simple as providing a list of states \(ex: `touched`, `submitted`\) to match against. \(See: [`showErrorsOn`](/setup/configuration.md#parameters)\)
* Reset all controls to a pristine, untouched state and optionally reset their model values to an initial state. \(See: [`reset`](/components/form.md#resetmodelvalues-object-void)\)
* Using `ngDisabled` on a Formation form does what you would expect it to do; disables all controls in the form.
* Accessibility: Formation uses [ARIA](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA) attributes where applicable, and assigns matching `id` and `for` attributes to controls and labels, ensuring they are correctly associated with each other. Formation is also [`ngAria`](https://docs.angularjs.org/api/ngAria)-friendly.
