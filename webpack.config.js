// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------
'use strict';

const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const ExtractTextWebpackPlugin = require('extract-text-webpack-plugin');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const SassLintPlugin = require('sasslint-webpack-plugin');
const VisualizerWebpackPlugin = require('webpack-visualizer-plugin');

const packageJson = require('./package.json');
const resolve = require('path').resolve;
// const url = require('url');

const bourbon = require('bourbon');
const bourbonNeat = require('bourbon-neat');

const CONTEXT = resolve(__dirname, 'src');
const MODULE_NAME = packageJson.name;
const VERSION = packageJson.version;

const ENV = ['local', 'dist', 'test', 'stats'].reduce((obj, env) => Object.assign(obj, {
  [env]: process.argv.indexOf('--env.' + env) > -1
}), {});

module.exports = (env => {
  const config = {};

  // ---------------------------------------------------------------------------
  // ----- Core ----------------------------------------------------------------
  // ---------------------------------------------------------------------------

  // Set the root for compilation. All other file names and paths are assumed to
  // be relative to this.
  config.context = CONTEXT;


  // Set the application entrypoint(s).
  config.entry = {
    // Define the main application bundle.
    app: './app/index.js',
    // Define a vendor bundle which will contain all modules in package.json's
    // "dependencies".
    vendor: Object.keys(packageJson.dependencies)
  };


  // Configure output.
  config.output = {
    // Output directory.
    path: resolve(__dirname, 'dist'),
    // Output each file using the bundle name and a content-based hash.
    filename: '[name]-[chunkhash].js',
    sourceMapFilename: '[file].map',
    publicPath: '/'
  };


  // List of module names that will not be included in the bundle. Instead,
  // the bundle will expect them to be "require"-able (in CommonJS environments)
  // or available on the global scope (Browser environments).
  config.externals = [];


  // ---------------------------------------------------------------------------
  // ----- Loaders -------------------------------------------------------------
  // ---------------------------------------------------------------------------

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
    test: /\.(svg|png|jpg|gif|eot|ttf|woff|woff2)$/,
    loaders: ['url?limit=10000']
  });


  // HTML (templates): Add to the Angular Template Cache and return a URL
  // pointing to the template.
  config.module.loaders.push({
    test: /\.html$/,
    loaders: [`ngtemplate?requireAngular&relativeTo=${CONTEXT}&prefix=${MODULE_NAME}`, 'html'],
    exclude: [
      resolve(__dirname, 'src/app/index.html')
    ]
  });


  // ---------------------------------------------------------------------------
  // ----- Module Resolving ----------------------------------------------------
  // ---------------------------------------------------------------------------

  config.resolve = {
    modulesDirectories: [
      // Search for modules relative to source root.
      resolve(CONTEXT, 'app'),
      CONTEXT,
      resolve('./tests'),
      // Search for NPM modules.
      'node_modules'
    ]
  };


  // ---------------------------------------------------------------------------
  // ----- Plugins -------------------------------------------------------------
  // ---------------------------------------------------------------------------

  config.plugins = [];


  // Configure source map plugin.
  config.plugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[file].map'
  }));


  // Responsible for managing index.html and injecting references to bundles.
  config.plugins.push(new HtmlWebpackPlugin({
    template: './app/index.html',
    chunksSortMode: 'dependency',
    showErrors: !env.dist
  }));


  // Favicons!
  if (env.dist) {
    config.plugins.push(new FaviconsWebpackPlugin({
      logo: resolve(CONTEXT, 'assets/icons/favicon-1024.png'),
      // Output prefix for all image files.
      prefix: 'icons-[hash]/',
      // Do not emit stats of the generated icons.
      emitStats: false,
      // Generate a cache file with control hashes and don't rebuild the favicons
      // until those hashes change.
      persistentCache: true,
      // Inject generated HTML into HtmlWebpackPlugin.
      inject: true,
      // Application title.
      title: 'App'
    }));
  }


  // Responsible for extracting the CSS in the bundle into a separate file.
  config.plugins.push(new ExtractTextWebpackPlugin('[name]-[chunkhash].css', {
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
    config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor'
    }));
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


  // ---------------------------------------------------------------------------
  // ----- Development Server --------------------------------------------------
  // ---------------------------------------------------------------------------

  // Protocol.
  // const PROTOCOL = 'https';

  // Default subdomain to use.
  // const SUBDOMAIN = 'join';

  // Determine API server to use.
  // let API_SERVER;

  // switch (process.env.API_SERVER) {
  //   // Use an empty string for production.
  //   case 'prod':
  //     API_SERVER = '';
  //     break;
  //   // If falsy, proxy to "local".
  //   case '':
  //   case false:
  //     API_SERVER = 'local';
  //     break;
  //   // Otherwise, proxy to the specified environment.
  //   default:
  //     API_SERVER = process.env.API_SERVER;
  //     break;
  // }

  // Build host string.
  // const HOST = [SUBDOMAIN, API_SERVER, 'collectivehealth', 'com'].filter(i => !!i).join('.');

  config.devServer = {
    inline: true,
    host: '0.0.0.0',
    port: env.port || 8080,
    historyApiFallback: true,
    // Configure output.
    stats: {
      colors: true,
      hash: false,
      version: false,
      timings: true,
      assets: false,
      chunks: false,
      modules: false,
      reasons: false,
      children: false,
      source: false,
      errors: true,
      errorDetails: true,
      warnings: true,
      publicPath: false
    }
    // Configure proxy.
    // proxy: {
    //   '/api': {
    //     target: url.format({
    //       protocol: PROTOCOL,
    //       host: HOST
    //     }),
    //     secure: false,
    //     headers: {
    //       'Host': HOST
    //     }
    //   }
    // }
  };


  // ---------------------------------------------------------------------------
  // ----- Miscellany ----------------------------------------------------------
  // ---------------------------------------------------------------------------

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
      // resolve('./src/lib/scss')
      'node_modules'
    ]
    .concat(bourbon.includePaths)
    .concat(bourbonNeat.includePaths)
  };


  // Configuration for the PostCSS loader.
  config.postcss = () => [
    autoprefixer
  ];


  return config;
})(ENV);
