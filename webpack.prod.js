const ExtractTextPlugin = require('extract-text-webpack-plugin');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = merge(common, {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          publicPath: '../',
          use: [
            {
              loader: 'css-loader',
              options: { sourceMap: true, options: { minimize: true } },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: loader => [
                  require('postcss-cssnext')({
                    browsers: ['last 2 versions', '> 5%'],
                  }),
                  require('cssnano')(),
                ],
                sourceMap: true,
              },
            },
          ],
        }),
      },
    ],
  },
  // plugins: [new UglifyJsPlugin()],
});
