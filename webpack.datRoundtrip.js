const path = require('path');

module.exports = {
  mode: 'development',
  target: 'node',
  entry: {
    datRoundtrip: './datRoundtrip.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'js')
  },
  module: {
    rules: [{
      test: /\.tsx?$/,
      exclude: /node_modules/,
      use: {
        loader: 'ts-loader',
        options: {
          configFile: 'tsconfig.datRoundtrip.json'
        }
      }
    }]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  }
};
