// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------
'use strict';

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const SassLintPlugin = require('sasslint-webpack-plugin');
const VisualizerWebpackPlugin = require('webpack-visualizer-plugin');

const packageJson = require('./package.json');
const resolve = require('path').resolve;

const CONTEXT = resolve(__dirname, 'src');
const MODULE_NAME = packageJson.name;
const VERSION = packageJson.version;

const ENV = ['local', 'dist', 'test', 'stats'].reduce((obj, env) => Object.assign(obj, {
  [env]: process.argv.indexOf('--env.' + env) > -1
}), {});

module.exports = (env => {
  const config = {};


  // ----- Core ----------------------------------------------------------------

  // Set the root for compilation. All other file names and paths are assumed to
  // be relative to this.
  config.context = CONTEXT;


  config.entry = {
    index: resolve(CONTEXT, 'index.js')
  };


  // Configure output.
  config.output = {
    // Output directory.
    path: resolve(__dirname, 'dist'),
    // Output each file using the bundle name and a content-based hash.
    filename: '[name].js',
    sourceMapFilename: '[file].map',
    publicPath: '/',
    library: MODULE_NAME,
    libraryTarget: 'umd'
  };


  // List of module names that will not be included in the bundle. Instead,
  // the bundle will expect them to be "require"-able (in CommonJS environments)
  // or available on the global scope (Browser environments).
  if (env.dist) {
    config.externals = {
      'angular': 'angular',
      'angular-messages': {
        commonjs: 'angular-messages',
        commonjs2: 'angular-messages',
        amd: 'angular-messages'
      },
      'ramda': {
        root: 'R',
        commonjs: 'ramda',
        commonjs2: 'ramda',
        amd: 'ramda'
      }
    };
  }


  // ----- Loaders -------------------------------------------------------------

  config.module = {
    preLoaders: [],
    loaders: []
  };


  // JavaScript: Lint source and emit errors to the browser console/terminal.
  if (env.local) {
    config.module.preLoaders.push({
      test: /\.(m)?js$/,
      loaders: ['eslint'],
      exclude: /node_modules/
    });
  }


  // JavaScript: Transpile and annotate.
  config.module.loaders.push({
    test: /\.(m)?js$/,
    loaders: ['ng-annotate?add=true', 'babel'],
    exclude: /node_modules/
  });


  // Sass: Compile, add PostCSS transforms, emit to ExtractText.
  config.module.loaders.push({
    test: /\.(c|sc|sa)ss$/,
    loader: ExtractTextWebpackPlugin.extract(['css?sourceMap', 'postcss', 'sass?sourceMap'])
  });


  // Static assets: Inline anything under 10k, otherwise emit a file in the
  // output directory and return a URL pointing to it.
  config.module.loaders.push({
    test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
    loaders: ['url?limit=10000']
  });


  config.module.loaders.push({
    test: /\.svg$/,
    loaders: ['svg-sprite']
  });


  // HTML (templates): Add to the Angular Template Cache and return a URL
  // pointing to the template.
  config.module.loaders.push({
    test: /\.html$/,
    loaders: [`ngtemplate?requireAngular&relativeTo=${CONTEXT}&prefix=${MODULE_NAME}`, 'html'],
    exclude: [
      resolve(CONTEXT, 'demo/index.html')
    ]
  });


  // ----- Module Resolving ----------------------------------------------------

  config.resolve = {
    modulesDirectories: [
      // Search for modules relative to source root.
      resolve(CONTEXT, 'demo'),
      CONTEXT,
      resolve('./tests'),
      // Search for NPM modules.
      'node_modules'
    ]
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins = [];


  // Configure source map plugin.
  config.plugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[file].map'
  }));


  // Responsible for extracting the CSS in the bundle into a separate file.
  config.plugins.push(new ExtractTextWebpackPlugin('[name].css', {
    allChunks: true
  }));


  // Lint Sass during compilation.
  if (env.local) {
    config.plugins.push(new SassLintPlugin({
      failOnError: false,
      failOnWarning: false,
      ignorePlugins: ['extract-text-webpack-plugin', 'html-webpack-plugin']
    }));
  }


  // Define variables that will be available throughout the bundle. Webpack will
  // replace the reference to the variable with its value (hence the double
  // quotes) which will allow UglifyJS to completely remove unused blocks when
  // compiling.
  config.plugins.push(new webpack.DefinePlugin({
    // This is here to support Node conventions. Use webpack.ENV in app code.
    process: {
      'env.NODE_ENV': env.dist ? '"production"' : '"development"'
    },
    webpack: {
      // Expose name from package.json.
      MODULE_NAME: `"${MODULE_NAME}"`,
      // Expose version from package.json.
      VERSION: `"${VERSION}"`,
      // Define build environment.
      ENV: env.dist ? '"dist"' : env.test ? '"test"' : '"local"'
    }
  }));


  if (env.stats) {
    // Generates statistics about what contributes to bundle size.
    config.plugins.push(new VisualizerWebpackPlugin({
      filename: resolve(CONTEXT, 'stats/index.html')
    }));
  }


  if (!env.test) {

    /**
     * Do not use the CommonsChunkPlugin when testing. This ensures that the
     * entire app is emitted as a single bundle (index.js).
     */
    // config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    //   name: 'vendor'
    // }));
  }


  // Use these plugins only when compiling the application.
  if (env.dist) {
    // Ensure modules are only emitted to bundles once.
    config.plugins.push(new webpack.optimize.DedupePlugin());

    // Minify source.
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    }));
  }


  // ----- Miscellany ----------------------------------------------------------

  // Exit on error when compiling.
  config.bail = env.dist;


  // Configuration for the ESLint loader.
  config.esLint = {
    // Exit on error when compiling.
    failOnError: env.dist
  };


  // Configuration for the Sass loader.
  config.sassLoader = {
    includePaths: [
      CONTEXT,
      'node_modules'
    ]
  };


  // Configuration for the PostCSS loader.
  config.postcss = () => [
    autoprefixer
  ];


  return config;
})(ENV);
