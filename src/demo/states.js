import app from 'app';
import mainComponent from 'views/main/main';


app.config(($locationProvider, $stateProvider, $urlRouterProvider) => {
  $locationProvider.html5Mode(true).hashPrefix('!');
  $urlRouterProvider.otherwise('/');

  /**
   * Abstract (un-enterable) base state. Sets up global layout (nav, footer).
   */
  $stateProvider.state({
    name: 'Base',
    url: '/',
    views: {
      'main': {
        component: mainComponent
      }
    }
  });
});


/**
 * Routing error-handler.
 */
app.run(($log, $state) => {
  $state.defaultErrorHandler(error => {
    if (webpack.ENV === 'local') {
      $log.error('[ui-router] Error:', error.message);
    }

    switch (error && error.message) {
      default:
        $state.go('PageNotFound', {}, {location: false});
        break;
    }
  });
});
