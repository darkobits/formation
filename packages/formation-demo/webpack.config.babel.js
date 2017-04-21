// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------
'use strict';

import path from 'path';
import autoprefixer from 'autoprefixer';
import bourbon from 'bourbon';
import bourbonNeat from 'bourbon-neat';
import ExtractTextWebpackPlugin from 'extract-text-webpack-plugin';
import formationJson from '@darkobits/formation/package';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import SassLintPlugin from 'sasslint-webpack-plugin';
import VisualizerWebpackPlugin from 'webpack-visualizer-plugin';
import webpack from 'webpack';
import packageJson from './package';

const resolve = path.resolve;

const CONTEXT = resolve(__dirname, 'src');
const MODULE_NAME = packageJson.name;
const VERSION = packageJson.version;


export default env => {
  const config = {};


  // ----- Core ----------------------------------------------------------------

  // Set the root for compilation. All other file names and paths are assumed to
  // be relative to this.
  config.context = CONTEXT;


  config.entry = {
    index: resolve(CONTEXT, 'index.js'),
    vendor: Object.keys(packageJson.dependencies)
  };


  // Configure output.
  config.output = {
    // Output directory.
    path: resolve(__dirname, 'dist'),
    // Output each file using the bundle name and a content-based hash.
    filename: '[name]-[chunkhash].js',
    sourceMapFilename: '[file]-[chunkhash].map',
    publicPath: '/formation/'
  };


  // ----- Loaders -------------------------------------------------------------

  config.module = {
    rules: []
  };


  // JavaScript: Lint source and emit errors to the browser console/terminal.

  // const xoLoader = {
  //   loader: 'xo-loader',
  //   options: {
  //     // Exit on error when compiling.
  //     failOnError: env.dist,
  //     failOnWarning: env.dist,
  //     emitError: env.dist,
  //     emitWarning: true
  //   }
  // };

  // config.module.rules.push({
  //   enforce: 'pre',
  //   test: /\.(m)?js$/,
  //   exclude: /node_modules/,
  //   use: [
  //     xoLoader
  //   ]
  // });


  // JavaScript: Transpile and annotate.

  const babelLoader = {
    loader: 'babel-loader'
  };


  config.module.rules.push({
    test: /\.(m)?js$/,
    exclude: /node_modules/,
    use: [
      babelLoader
    ]
  });


  // Sass: Compile, add PostCSS transforms, emit to ExtractText.

  const sassLoader = {
    loader: 'sass-loader',
    options: {
      sourceMap: true,
      includePaths: [
        CONTEXT,
        resolve(CONTEXT, 'etc', 'style'),
        'node_modules'
      ]
      .concat(bourbon.includePaths)
      .concat(bourbonNeat.includePaths)
    }
  };

  const postCssLoader = {
    loader: 'postcss-loader',
    options: {
      plugins () {
        return [
          autoprefixer
        ];
      }
    }
  };

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: true,
      minimize: true
    }
  };

  const extractSass = new ExtractTextWebpackPlugin({
    filename: '[name].[contenthash].css',
    allChunks: true
  });

  config.module.rules.push({
    test: /\.(c|sc|sa)ss$/,
    use: extractSass.extract({
      use: [
        cssLoader,
        postCssLoader,
        sassLoader
      ]
    })
  });


  // Static assets: Inline anything under 10k, otherwise emit a file in the
  // output directory and return a URL pointing to it.

  const urlLoader = {
    loader: 'url-loader',
    options: {
      limit: 10000
    }
  };

  config.module.rules.push({
    test: /\.(png|jpg|gif|eot|ttf|woff|woff2)$/,
    use: [
      urlLoader

    ]
  });


  const svgSpriteLoader = {
    loader: 'svg-sprite-loader'
  };

  config.module.rules.push({
    test: /\.svg$/,
    use: [
      svgSpriteLoader
    ]
  });


  // HTML (templates): Add to the Angular Template Cache and return a URL
  // pointing to the template.

  const ngTemplateLoader = {
    loader: 'ngtemplate-loader',
    options: {
      requireAngular: true,
      relativeTo: CONTEXT,
      prefix: MODULE_NAME
    }
  };

  const htmlLoader = {
    loader: 'html-loader'
  };

  config.module.rules.push({
    test: /\.html$/,
    exclude: [
      resolve(CONTEXT, 'index.html')
    ],
    use: [
      ngTemplateLoader,
      htmlLoader
    ]
  });


  // ----- Module Resolving ----------------------------------------------------

  // Resolve modules from the build context and node_modules.
  config.resolve = {
    modules: [
      CONTEXT,
      'node_modules'
    ]
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins = [];


  // Configure source map plugin.
  config.plugins.push(new webpack.SourceMapDevToolPlugin({
    filename: '[file].map'
  }));


  // Responsible for managing index.html and injecting references to bundles.
  config.plugins.push(new HtmlWebpackPlugin({
    template: resolve(CONTEXT, 'index.html'),
    chunksSortMode: 'dependency',
    showErrors: true
  }));


  // Put any common modules in the vendor bundle.
  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor'
  }));


  // Responsible for extracting the CSS in the bundle into a separate file.
  config.plugins.push(extractSass);


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
      // Define build environment.
      ENV: env.dist ? '"dist"' : env.test ? '"test"' : '"local"',
      FORMATION_VERSION: `"${formationJson.version}"`,
      // Expose name from package.json.
      MODULE_NAME: `"${MODULE_NAME}"`,
      // Expose version from package.json.
      VERSION: `"${VERSION}"`
    }
  }));


  if (env.stats) {
    // Generates statistics about what contributes to bundle size.
    config.plugins.push(new VisualizerWebpackPlugin({
      filename: resolve(CONTEXT, 'stats/index.html')
    }));
  }


  if (env.dist) {
    config.plugins.push(new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false,
        dead_code: true // eslint-disable-line camelcase
      },
      mangle: true,
      output: {
        comments: false
      }
    }));
  }


  // ----- Development Server --------------------------------------------------

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
  };


  // ----- Miscellany ----------------------------------------------------------

  // Exit on error when compiling.
  config.bail = env.dist;

  config.devtool = 'cheap-module-eval-source-map';


  return config;
};
