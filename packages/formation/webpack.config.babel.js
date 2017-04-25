// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';
import VisualizerWebpackPlugin from 'webpack-visualizer-plugin';
import webpack from 'webpack';

const resolve = path.resolve;
const CONTEXT = resolve(__dirname, 'src');


export default env => {
  const config = {module: {rules: []}, plugins: []};


  // ----- Core ----------------------------------------------------------------

  config.context = CONTEXT;

  config.entry = {
    index: resolve(CONTEXT, 'index.js')
  };

  config.output = {
    path: resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    sourceMapFilename: '[file].map',
    library: 'Formation',
    libraryTarget: 'umd'
  };

  config.externals = {
    angular: 'angular',
    'angular-messages': {
      commonjs: 'angular-messages',
      commonjs2: 'angular-messages',
      amd: 'angular-messages'
    },
    ramda: {
      commonjs: 'ramda',
      commonjs2: 'ramda',
      amd: 'ramda',
      root: 'R'
    }
  };


  // ----- Loaders -------------------------------------------------------------

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


  // ----- Plugins -------------------------------------------------------------

  if (env.stats) {
    config.plugins.push(new VisualizerWebpackPlugin({
      filename: 'stats.html'
    }));
  }

  config.plugins.push(new webpack.optimize.UglifyJsPlugin({
    compress: {
      warnings: false,
      dead_code: true // eslint-disable-line camelcase
    },
    mangle: true,
    output: {
      comments: false
    },
    sourceMap: true
  }));


  // ----- Miscellany ----------------------------------------------------------

  config.bail = true;

  config.devtool = 'cheap-module-source-map';


  return config;
};
