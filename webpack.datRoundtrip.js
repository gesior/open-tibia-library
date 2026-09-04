const path = require('path');

let babelOptions = {
  "presets": ["env"]
};

module.exports = {
  target: 'node',
  entry: {
    datRoundtrip: ['babel-polyfill', './datRoundtrip.ts']
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'js')
  },
  module: {
    rules: [{
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: babelOptions
        },
        {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.datRoundtrip.json'
          }
        }
      ]
    }, {
      test: /\.js$/,
      exclude: /node_modules/,
      use: [
        {
          loader: 'babel-loader',
          options: babelOptions
        }
      ]
    }]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  node: {
    __dirname: false,
    __filename: false
  }
};
