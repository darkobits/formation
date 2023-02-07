![formation](https://user-images.githubusercontent.com/441546/36626621-d671c000-18ea-11e8-8c88-c462d806d23a.png)

[![][npm-img]][npm-url] [![][travis-img]][travis-url] [![][codacy-img]][codacy-url] [![][cc-img]][cc-url] [![][xo-img]][xo-url]

## ⚠️ Deprecation Notice

This project is no longer actively maintained.

---

Formation is a form framework for Angular 1.5+ designed for medium-to-large applications that require consistent, robust forms. It aims to reduce template size by moving business logic to controllers, which also encourages code-reuse and improves consistency.

## Install

```bash
$ npm i @darkobits/formation
```

```js
import Formation, {
  configure as configureFormation
} from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);

// Configure global error behavior.
configureFormation({
  showErrorsOn: 'touched, submitted'
});
```

## Changelogs

* [formation](/packages/formation/CHANGELOG.md)
* [formation-validators](/packages/formation-validators/CHANGELOG.md)

## Documentation

The Formation documentation is [available on GitBook](https://darkobits.gitbooks.io/formation/).

## &nbsp;
<p align="center">
  <br>
  <img width="22" height="22" src="https://cloud.githubusercontent.com/assets/441546/25318539/db2f4cf2-2845-11e7-8e10-ef97d91cd538.png">
</p>

[travis-img]: https://img.shields.io/travis/darkobits/formation.svg?style=flat-square
[travis-url]: https://travis-ci.org/darkobits/formation

[npm-img]: https://img.shields.io/npm/v/@darkobits/formation.svg?style=flat-square
[npm-url]: https://www.npmjs.com/package/@darkobits/formation

[codacy-img]: https://img.shields.io/codacy/coverage/e3fb8e46d6a241f5a952cf3fe6a49d06.svg?style=flat-square
[codacy-url]: https://www.codacy.com/app/darkobits/formation

[xo-img]: https://img.shields.io/badge/code_style-XO-e271a5.svg?style=flat-square
[xo-url]: https://github.com/sindresorhus/xo

[cc-img]: https://img.shields.io/badge/conventional%20commits-1.0.0-027dc6.svg?style=flat-square
[cc-url]: https://github.com/conventional-changelog/standard-version
