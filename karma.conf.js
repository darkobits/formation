// Set NODE_ENV to test to ensure Babel loads the Istanbul plugin. (See .babelrc)
process.env.NODE_ENV = 'test';


const webpackConfig = require('./webpack.config.js');

module.exports = config => {
  const GLOBS = {
    src: 'src/index.js',
    specs: 'tests/**/*.spec.js'
  };

  config.set({
    /**
     * Base path that will be used to resolve all patterns (eg. files, exclude).
     */
    basePath: '',


    /**
     * Frameworks to use.
     * Available frameworks: https://npmjs.org/browse/keyword/karma-adapter
     */
    frameworks: ['jasmine'],


    /**
     * List of files / patterns to load in the browser.
     */
    files: [
      require.resolve('babel-polyfill/browser'),

      /**
       * Require all of the files that would normally be loaded in index.html
       * from CDNs.
       */
      'src/runtimeConfig.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-mocks.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-animate.min.js',
      'https://ajax.googleapis.com/ajax/libs/angularjs/1.5.7/angular-sanitize.min.js',
      {
        pattern: GLOBS.src,
        watched: false
      },
      {
        pattern: GLOBS.specs,
        watched: false
      }
    ],


    /**
     * List of files to exclude.
     */
    exclude: [
    ],


    /**
     * Preprocess matching files before serving them to the browser.
     * Available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
     */
    preprocessors: {
      [GLOBS.src]: ['webpack'],
      [GLOBS.specs]: ['webpack']
    },


    webpack: webpackConfig,


    webpackMiddleware: {
      // Suppress Webpack output when running tests.
      noInfo: true
    },


    /**
     * Test results reporter to use.
     * Possible values: 'dots', 'progress'
     * Available reporters: https://npmjs.org/browse/keyword/karma-reporter
     */
    reporters: ['progress', 'coverage'],


    /**
     * Configuration for the coverage reporter.
     */
    coverageReporter: {
      dir: 'coverage',
      reporters: [
        // Generates lcov and HTML reports.
        {type: 'lcov', subdir: '.'},
        // Generates a text summary report in the terminal.
        {type: 'text-summary'}
      ],
      check: {
        global: {
          statements: 32,
          branches: 24
        }
      }
    },


    /**
     * Web server port.
     */
    port: 9876,


    /**
     * Enable/disable colors in the output (reporters and logs).
     */
    colors: true,


    /**
     * Level of logging.
     * Possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
     */
    logLevel: config.LOG_INFO,


    /**
     * Enable/disable watching file and executing tests whenever any file changes.
     */
    autoWatch: false,


    /**
     * Start these browsers.
     * Available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
     */
    browsers: ['PhantomJS'],


    /**
     * Continuous Integration mode.
     * If true, Karma captures browsers, runs the tests and exits.
     */
    singleRun: true,


    /**
     * Concurrency level.
     * How many browser should be started simultaneous.
     */
    concurrency: Infinity
  });
};
