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
  const config = {module: {rules: []}, plugins: []};


  // ----- Core ----------------------------------------------------------------

  config.context = CONTEXT;

  config.entry = {
    index: resolve(CONTEXT, 'index.js'),
    vendor: Object.keys(packageJson.dependencies)
  };

  config.output = {
    path: resolve(__dirname, 'dist'),
    filename: '[name]-[chunkhash].js',
    sourceMapFilename: '[file]-[chunkhash].map',
    publicPath: '/formation/'
  };


  // ----- JavaScript Loaders --------------------------------------------------

  const xoLoader = {
    loader: 'xo-loader',
    options: {
      failOnError: env.dist,
      failOnWarning: env.dist,
      emitError: env.dist,
      emitWarning: true
    }
  };

  config.module.rules.push({
    enforce: 'pre',
    test: /\.(m)?js$/,
    exclude: /node_modules|packages/,
    use: [
      xoLoader
    ]
  });


  const babelLoader = {
    loader: 'babel-loader'
  };

  config.module.rules.push({
    test: /\.(m)?js$/,
    exclude: /node_modules|packages/,
    use: [
      babelLoader
    ]
  });


  // ----- CSS Loaders ---------------------------------------------------------

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
      sourceMap: true,
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


  // ----- Template Loaders ----------------------------------------------------

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


  // ----- Misc Loaders --------------------------------------------------------

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


  // ----- Module Resolving ----------------------------------------------------

  config.resolve = {
    modules: [
      CONTEXT,
      'node_modules'
    ]
  };


  // ----- Plugins -------------------------------------------------------------

  config.plugins.push(new HtmlWebpackPlugin({
    template: resolve(CONTEXT, 'index.html'),
    chunksSortMode: 'dependency',
    showErrors: true
  }));

  config.plugins.push(new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor'
  }));

  config.plugins.push(extractSass);

  if (env.dev) {
    config.plugins.push(new SassLintPlugin({
      failOnError: false,
      failOnWarning: false,
      ignorePlugins: ['extract-text-webpack-plugin', 'html-webpack-plugin']
    }));
  }

  config.plugins.push(new webpack.DefinePlugin({
    process: {
      'env.NODE_ENV': env.dist ? '"production"' : '"development"'
    },
    webpack: {
      ENV: env.dist ? '"dist"' : env.test ? '"test"' : '"local"',
      FORMATION_VERSION: `"${formationJson.version}"`,
      MODULE_NAME: `"${MODULE_NAME}"`,
      VERSION: `"${VERSION}"`
    }
  }));

  if (env.stats) {
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
    historyApiFallback: true
  };


  // ----- Miscellany ----------------------------------------------------------

  config.bail = env.dist;

  config.devtool = env.dist ? 'cheap-module-eval-source-map' : 'inline-source-map';


  return config;
};
