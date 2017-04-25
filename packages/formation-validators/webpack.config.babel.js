// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';
import webpack from 'webpack';

const resolve = path.resolve;
const CONTEXT = resolve(__dirname, 'src');


export default () => {
  const config = {module: {rules: []}, plugins: []};


  // ----- Core ----------------------------------------------------------------

  config.context = CONTEXT;

  config.entry = {
    validators: resolve(CONTEXT, 'validators.js')
  };

  config.output = {
    path: resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    sourceMapFilename: '[file].map',
    library: 'FormationValidators',
    libraryTarget: 'umd'
  };

  config.externals = {
    '@darkobits/formation': {
      commonjs: '@darkobits/formation',
      commonjs2: '@darkobits/formation',
      amd: '@darkobits/formation',
      root: 'Formation'
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
