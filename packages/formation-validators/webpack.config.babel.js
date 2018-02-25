import {resolve} from 'path';


export default () => {
  const config = {module: {rules: []}, plugins: []};

  const CONTEXT = resolve(__dirname, 'src');


  // ----- Core ----------------------------------------------------------------

  config.context = CONTEXT;

  config.entry = {
    index: resolve(CONTEXT, 'validators.js')
  };

  config.output = {
    path: resolve(__dirname, 'dist'),
    filename: '[name].js',
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


  // ----- JavaScript Loaders --------------------------------------------------

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


  // ----- Miscellany ----------------------------------------------------------

  config.bail = true;

  config.devtool = 'cheap-module-source-map';


  return config;
};
