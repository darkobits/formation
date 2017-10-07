# Conventions Used In This Book

* Code samples in this book are written in ES6, so you should have a solid grasp of ES6 features before continuing.

  > See: [How to Learn ES6](https://medium.com/javascript-scene/how-to-learn-es6-47d9a1ac2620) by Eric Elliott & Babel's [Learn ES2015](https://babeljs.io/learn-es2015/) article.

* Formation relies heavily on Angular `components`, introduced in version 1.5. You should familiarize yourself with this API before reading this guide.

  > See: AngularJS's [Understanding Components](https://docs.angularjs.org/guide/component) article.

* The variable `vm` is commonly used throughout code samples and refers to a generic parent controller's `controllerAs` alias.

  > See: [AngularJS's Controller As and the `vm` Variable](https://johnpapa.net/angularjss-controller-as-and-the-vm-variable/) by John Papa

* `import app from 'app';`is commonly used throughout code samples and refers to an Angular module reference. When using a module-bundler like Webpack, it is more terse and less error-prone to refer to an application's Angular module directly, by reference, rather than using `angular.module` to look it up.

  Prior to module-bundlers, this how Angular modules were referenced:

  ```js
  // app.js
  angular.module('MyApp', []);
  ```

  ```js
  // fooCtrl.js
  angular.module('MyApp').controller('FooCtrl', function () {
    // ...
  });
  ```

  These files were then concatenated using some [hack](https://github.com/sirlantis/gulp-order) to ensure that `app.js` appeared in the output bundle before `fooCtrl.js`.

  With the advent of module-bundlers, it is much more practical to simply create a module that exports a reference to the Angular app:

  ```js
  // app.js
  import angular from 'angular';

  export default angular.module('MyApp', []);
  ```

  ```js
  // fooCtrl.js
  import app from 'app';

  app.controller('FooCtrl', function () {
    // ...
  });
  ```

* `// =>` is used to denote the result of evaluating of the preceding expression.

  ```js
  'b' + 'a' + + 'a' + 'a'; // => 'baNaNa';
  ```



