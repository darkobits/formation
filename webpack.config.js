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


module.exports = env => {
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
    rules: []
  };


  // JavaScript: Lint source and emit errors to the browser console/terminal.
  config.module.rules.push({
    enforce: 'pre',
    test: /\.(m)?js$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'eslint-loader',
        options: {
          // Exit on error when compiling.
          failOnError: env.dist
        }
      }
    ]
  });


  // JavaScript: Transpile and annotate.
  config.module.rules.push({
    test: /\.(m)?js$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ng-annotate-loader',
        options: {
          add: true
        }
      },
      {
        loader: 'babel-loader'
      }
    ]
  });


  // Sass: Compile, add PostCSS transforms, emit to ExtractText.
  config.module.rules.push({
    test: /\.(c|sc|sa)ss$/,
    use: ExtractTextWebpackPlugin.extract([
      {
        loader: 'css-loader',
        options: {
          sourceMap: true
        }
      },
      {
        loader: 'postcss-loader',
        options: {
          plugins () {
            return [
              autoprefixer
            ];
          }
        }
      },
      {
        loader: 'sass-loader',
        options: {
          sourceMap: true,
          includePaths: [
            CONTEXT,
            'node_modules'
          ]
        }
      }
    ])
  });


  // Static assets: Inline anything under 10k, otherwise emit a file in the
  // output directory and return a URL pointing to it.
  config.module.rules.push({
    test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
    use: [
      {
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  });


  config.module.rules.push({
    test: /\.svg$/,
    use: [
      {
        loader: 'svg-sprite-loader'
      }
    ]
  });


  // HTML (templates): Add to the Angular Template Cache and return a URL
  // pointing to the template.
  config.module.rules.push({
    test: /\.html$/,
    use: [
      {
        loader: 'ngtemplate',
        options: {
          requireAngular: true,
          relativeTo: CONTEXT,
          prefix: MODULE_NAME
        }
      },
      {
        loader: 'html'
      }
    ]
  });


  // ----- Module Resolving ----------------------------------------------------

  config.resolve = {
    modules: [
      CONTEXT,
      resolve('./tests'),
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


  // ----- Miscellany ----------------------------------------------------------

  // Exit on error when compiling.
  config.bail = env.dist;


  return config;
};
