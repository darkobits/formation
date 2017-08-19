# Installation

Formation consists of two packages, `formation` and `formation-validators` \(optional\).

Each can be installed using Yarn or NPM:

```bash
$ yarn add @darkobits/formation
$ yarn add @darkobits/formation-validators
```

```bash
$ npm install --save @darkobits/formation
$ npm install --save @darkobits/formation-validators
```

Once installed, add Formation to your Angular module's dependencies:

```js
import Formation from '@darkobits/formation';

angular.module('MyApp', [
  Formation
]);
```

You are now ready to begin using Formation [components](/components/README.md) in your application!

