// -----------------------------------------------------------------------------
// ----- Webpack Configuration -------------------------------------------------
// -----------------------------------------------------------------------------

import path from 'path';
import VisualizerWebpackPlugin from 'webpack-visualizer-plugin';
import webpack from 'webpack';

const resolve = path.resolve;
const CONTEXT = resolve(__dirname, 'src');


export default env => {
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

  config.module = {
    rules: []
  };


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


  // ----- Module Resolving ----------------------------------------------------

  // Resolve modules from the build context and node_modules.
  // config.resolve = {
  //   modules: [
  //     CONTEXT,
  //     'node_modules'
  //   ]
  // };


  // ----- Plugins -------------------------------------------------------------

  config.plugins = [];


  // Define variables that will be available throughout the bundle. Webpack will
  // replace the reference to the variable with its value (hence the double
  // quotes) which will allow UglifyJS to completely remove unused blocks when
  // compiling.
  // config.plugins.push(new webpack.DefinePlugin({
  //   // This is here to support Node conventions. Use webpack.ENV in app code.
  //   process: {
  //     'env.NODE_ENV': env.dist ? '"production"' : '"development"'
  //   },
  //   webpack: {
  //     // Define build environment.
  //     ENV: env.dist ? '"dist"' : env.test ? '"test"' : '"local"',
  //     // FORMATION_VERSION: `"${formationJson.version}"`,
  //     // Expose name from package.json.
  //     MODULE_NAME: `"${MODULE_NAME}"`,
  //     // Expose version from package.json.
  //     VERSION: `"${VERSION}"`
  //   }
  // }));


  if (env.stats) {
    // Generates statistics about what contributes to bundle size.
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

  // Exit on error when compiling.
  config.bail = env.dist;

  // Configure source maps.
  config.devtool = env.dist ? 'cheap-module-source-map' : 'cheap-module-eval-source-map';


  return config;
};
