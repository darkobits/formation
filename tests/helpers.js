import angular from 'angular';
import 'angular-mocks';


class MockUrlRouterProvider {
  rule () {
    return this;
  }
  when () {
    return this;
  }
  otherwise () {
    return this;
  }
  $get () {
    return {
      sync: () => {}
    };
  }
}


/**
 * A library to make testing Angular applications with Karma suck less.
 *
 * @class NgUnit
 */
export default class NgUnit {
  constructor () {
    this.spec = {};
  }


  /**
   * Returns the named injectable, or undefined if the injectable doesn't exist.
   *
   * @param  {string} name - Name of an injectable.
   * @return {object} - Injectable instance.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * let T = new NgUnit();
   *
   * let promise = T.get('$q').when(true);
   */
  get (name) {
    let injectable;

    try {
      angular.mock.inject($injector => {
        injectable = $injector.get(name);
      });

      return injectable;
    } catch (err) {
      throw new Error(`[Karma Tools] Cannot find injectable "${name}": ${err.message}`);
    }
  }


  /**
   * Loads a list of injectables and attaches them to the instance.
   *
   * @private
   *
   * @param {array} injectables - List of injectables to laod.
   */
  loadInjectables (injectables) {
    if (injectables && injectables.length > 0) {
      angular.forEach(injectables, name => {
        this.spec[name] = this.get(name);
      });
    }
  }


  /**
   * Instantiates a module. By default, `$urlRouter` is mocked to prevent the
   * router from interfering with tests. This can be disabled if needed.
   * Additional mocked injectables can be specified.
   *
   * @param {string} module - Module to load.
   * @param {object} [opts] - Options object.
   * @param {boolean} [opts.mockUrlRouter=true] - Whether to mock $urlRouter.
   * @param {object} [opts.mock] - Object with values that will be used to
   *   create mocked injectables.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     T.prepareModule('MyAwesomeApp', {
   *       mock: {
   *         SomeAwesomeService: {
   *           callApi: function () {
   *             return Tools.get('$q').resolve({
   *               get: 'bar'
   *             })
   *           },
   *           logOut: function () {
   *            return true;
   *           }
   *         }
   *       }
   *     });
   *   });
   *
   *   // ...
   * });
   */
  prepareModule (module, opts = {}) {
    opts = Object.assign({}, opts, {
      mockUrlRouter: true
    });

    angular.mock.module(module, ($provide, $injector) => {
      this._providerInjector = $injector;

      // Mock $urlRouterProvider by default to prevent most router and resolve
      // related issues when testing.
      if (opts.mockUrlRouter) {
        $provide.provider('$urlRouter', new MockUrlRouterProvider());
      }

      if (opts.mock) {
        Object.keys(opts.mock).forEach(name => {
          const value = opts.mock[name];
          console.log('MOCKING', name, 'WITH', value);
          $provide.value(name, value);
        });
      }
    });

    angular.mock.inject();
  }


  /**
   * Configures the instance for testing a controller.
   *
   * @param {string} ctrlExp - Name of the controller being tested. Supports
   *   'controller as' syntax for testing controllers that use `$scope`.
   * @param {object} [opts] - Options object.
   * @param {array} [opts.inject] - List of additional required injectables.
   * @param {object} [opts.locals] - Mocked locals, passed to controller. Useful
   *   for mocking resolved spec.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     // Use T.prepareModule to instantiate your module, then:
   *
   *     T.prepareController('MyAwesomeCtrl', {
   *       inject: ['SomeAwesomeService', 'AnotherAwesomeService']
   *     });
   *   });
   *
   *   it('should be awesome', () => {
   *     //=> T.spec:
   *     // {
   *     //   $scope: Object{ ... },
   *     //   MyAwesomeCtrl: Object{ ... },
   *     //   SomeAwesomeService: Object{ ... },
   *     //   AnotherAwesomeService: Object{ ... }
   *     // }
   *   });
   * });
   */
  prepareController (ctrlExp, opts = {}) {
    this.spec.$scope = this.get('$rootScope').$new();

    // Parse controller expression.
    const [ctrlName, ctrlAs] = ctrlExp.split(' as ');

    this.spec[ctrlName] = this.get('$controller')(ctrlName, Object.assign({}, opts.locals, {
      $scope: this.spec.$scope
    }));

    // Assign right hand side of controller-as expression, if defined, to $scope.
    if (ctrlAs) {
      this.spec.$scope[ctrlAs] = this.spec[ctrlName];
    }

    if (opts.inject) {
      this.loadInjectables(opts.inject);
    }
  }


  /**
   * Configures the instance for testing a directive.
   *
   * @param  {string} directive - Name of the direcrive being tested.
   * @param  {object} opts - Options object.
   * @param  {array}  opts.template - Template to use to test the directive.
   * @param  {array}  [opts.scope] - Properties of the directive's parent scope.
   * @param  {array}  [opts.inject] - List of additional required injectables.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     // Use T.prepareModule to instantiate your module, then:
   *
   *     T.prepareDirective('MyAwesomeDirective', {
   *       template: `
   *         <my-awesome-directive
   *           ng-model="data">
   *         </my-awesome-directive>
   *       `,
   *       scope: {
   *         data: {
   *           get: 'bar'
   *         }
   *       }
   *     });
   *   });
   *
   *   it('should be awesome', () => {
   *     //=> T.spec:
   *     // {
   *     //   $element: // Directive's $element instance.
   *     //   $scope: // Parent scope.
   *     //   $isolateScope: // Directive's isolate scope, if one exists.
   *     //   MyAwesomeDirective: // Directive's controller.
   *     // }
   *   });
   * });
   */
  prepareDirective (directive, opts = {}) {
    let compiledDirective;

    this.spec.$scope = this.get('$rootScope').$new();

    if (!opts.template) {
      throw new Error('[Karma Tools] Directives require a template.');
    }

    // Ensure the directive is registered. This will throw if it isn't.
    this.get(directive + 'Directive');

    if (opts.scope) {
      this.spec.$scope.$apply(() => angular.extend(this.spec.$scope, opts.scope));
    }

    if (opts.inject) {
      this.loadInjectables(opts.inject);
    }

    if (opts.wrap) {
      // Compile the wrapper element.
      let compiledWrapper = this.get('$compile')(opts.wrap)(this.spec.$scope);

      // Construct directive's template.
      let directiveEl = angular.element(opts.template);

      // Append template to compiled wrapper.
      compiledWrapper.append(directiveEl);

      // Compile directive.
      compiledDirective = this.get('$compile')(directiveEl)(this.spec.$scope);
    } else {
      // Use simple directive compilation.
      compiledDirective = this.get('$compile')(opts.template)(this.spec.$scope);
    }

    // Attach directive's controller and element to spec.
    this.spec[directive] = compiledDirective.controller(directive);
    this.spec.$element = compiledDirective;

    // Run a digest cycle.
    this.spec.$scope.$digest();

    // Attach isolate scope.
    if (compiledDirective.isolateScope) {
      this.spec.$isolateScope = compiledDirective.isolateScope();
    }
  }


  /**
   * Configure the instnace for testing a component's controller.
   *
   * See:
   * - [Unit-testing Component Controllers]{@link https://docs.angularjs.org/guide/component#unit-testing-component-controllers}
   * - [$componentController]{@link https://docs.angularjs.org/api/ngMock/service/$componentController}
   *
   * @param  {string} component - Component name.
   * @param  {object} opts - Options object.
   * @param  {object} [opts.locals] - Injection locals for the controller.
   * @param  {object} [opts.$element] - Optional jqLite-wrapped DOM element that
   *   will mock $element, if used by the controller.
   * @param  {object} [opts.$attrs] - Optional object that will be used to mock
   *   $attrs, if used by the controller.
   * @param  {object} [opts.bindings] - Optional bindings to pass to the
   *   controller instance.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     // Use T.prepareModule to instantiate your module, then:
   *
   *     T.prepareComponentController('MyAwesomeComponent', {
   *       bindings: {
   *         foo: 'bar',
   *         baz: 'bleep'
   *       }
   *     });
   *   });
   *
   *   it('should be awesome', () => {
   *     //=> T.spec:
   *     // {
   *     //   $scope: Component's parent scope.
   *     //   MyAwesomeComponent: // Component's controller.
   *     // }
   *   });
   * });
   */
  prepareComponentController (component, opts = {}) {
    const $componentController = this.get('$componentController');

    this.spec.$scope = this.get('$rootScope').$new();

    // Attach component's controller.
    this.spec[component] = $componentController(component, Object.assign({
      $element: opts.$element,
      $attrs: opts.$attrs
    }, opts.locals), opts.bindings);

    this.spec.$scope.$digest();
  }


  /**
   * Configures the instance for testing a service.
   *
   * @param  {string} service - Name of the service being tested.
   * @param  {object} [opts] - Options object.
   * @param  {array}  [opts.inject] - List of additional required injectables.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     // Use T.prepareModule to instantiate your module, then:
   *
   *     T.prepareService('MyAwesomeService', {
   *       inject: ['$httpBackend']
   *     });
   *   });
   *
   *   it('should be awesome', () => {
   *     //=> T.spec:
   *     // {
   *     //   $scope: Object{ ... },
   *     //   MyAwesomeService: Object{ ... },
   *     //   $httpBackend: Object{ ... }
   *     // }
   *   });
   * });
   */
  prepareService (service, opts = {}) {
    this.spec.$scope = this.get('$rootScope').$new();
    this.spec[service] = this.get(service);

    if (opts.inject) {
      this.loadInjectables(opts.inject);
    }
  }


  prepareProvider (provider) {
    if (!this._providerInjector) {
      throw new Error('[Karma Tools] You must prepare a module before calling prepareProvider.');
    }

    this.spec[provider] = this._providerInjector.get(provider);
  }


  /**
   * Configures the instance for testing a filter.
   *
   * @param  {string} filter - Name of the filter being tested.
   * @param  {object} [opts] - Options object.
   * @param  {array}  [opts.inject] - List of additional required injectables.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * describe('MyAwesomeSpec', () => {
   *   let T;
   *
   *   beforeEach(() => {
   *     T = new NgUnit();
   *
   *     // Use T.prepareModule to instantiate your module, then:
   *
   *     T.prepareFilter('MyAwesomeFilter', {
   *       inject: ['SomeAwesomeService', 'AnotherAwesomeService']
   *     });
   *   });
   *
   *   it('should be awesome', () => {
   *     //=> T.spec:
   *     // {
   *     //   MyAwesomeFilter: Object{ ... },
   *     //   SomeAwesomeService: Object{ ... },
   *     //   AnotherAwesomeService: Object{ ... }
   *     // }
   *   });
   * });
   */
  prepareFilter (filter, opts = {}) {
    this.spec[filter] = this.get('$filter')(filter);

    if (opts.inject) {
      this.loadInjectables(opts.inject);
    }
  }


  /**
   * Builds a regular expression that can be passed to `$httpBackend` instead of
   * a string, which requires that the entire, exact URL be provided. URL
   * segments are position-sensitive. Parameters can be a partial set of the
   * query parameters sent, so only the ones relevant to the test need to be
   * provided.
   *
   * @param  {array} segments - List of URL segments you expect to see in the
   *   request, in order.
   * @param  {object} [params] - Query string params you expect to see
   *   in the request. May contain arrays and objects.
   * @return {RegExp} - Regular expression instance that can be passed to
   *   `$httpBackend.when()` for URL-matching.
   *
   * @example
   *
   * import NgUnit from '@darkobits/ng-unit';
   *
   * let T = new NgUnit();
   *
   * let sponsorId = 1;
   * let url = T.matchUrl(['sponsor', sponsorId], {expand: 'plans'});
   *
   * T.spec.$httpBackend.when('GET', url).respond({ ... })
   *
   * // The above will match a request like:
   * // "/api/v1/sponsor/1?expand=clientSuccessManager&expand=plans&expand=address"
   */
  matchUrl (segments, params) {
    return new RegExp([
      '^',
      segments.join('.*'),
      this.get('$httpParamSerializer')(params).replace('&', '.*'),
      '$'
    ].join('.*'), 'g');
  }
}
