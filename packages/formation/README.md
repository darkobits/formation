[![][travis-img]][travis-url] [![][npm-img]][npm-url] [![][deps-img]][deps-url] [![][peer-deps-img]][peer-deps-url] [![][dev-deps-img]][dev-deps-url]

# formation

This is the primary package for Formation.

## Install

```bash
$ yarn add @darkobits/formation
```

or

```bash
$ npm install --save @darkobits/formation
```

## Setup

1. Add the Formation module to your application's dependencies.

```js
import Formation from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);
```

2. [Configure](/packages/formation/src/etc/config#configureopts-object--void) error behavior. _(Optional)_

```js
import {
  configure
} from '@darkobits/formation';

configure({
  showErrorsOn: 'touched, submitted'
});
```

3. Begin using Formation [components](/packages/formation/src/components), or [building your own](/formation/src/etc/config#registercontrolname-string-definition-object--void)!

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/formation.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/formation

[npm-img]: https://img.shields.io/npm/v/@darkobits/formation.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/formation

[deps-img]: https://david-dm.org/darkobits/formation/status.svg?path=packages/formation&style=flat-square
[deps-url]: https://david-dm.org/darkobits/formation?path=packages/formation

[peer-deps-img]: https://david-dm.org/darkobits/formation/peer-status.svg?path=packages/formation&style=flat-square
[peer-deps-url]: https://david-dm.org/darkobits/formation?path=packages%2Fformation&type=peer

[dev-deps-img]: https://david-dm.org/darkobits/formation/dev-status.svg?path=packages/formation&style=flat-square
[dev-deps-url]: https://david-dm.org/darkobits/formation?path=packages%2Fformation&type=dev
