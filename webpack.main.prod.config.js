const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const TerserPlugin = require('terser-webpack-plugin');

const baseConfig = require('./webpack.main.config');

module.exports = merge.smart(baseConfig, {
  mode: 'production',
  plugins: [
    new TerserPlugin({
      cache: true,
      parallel: 4
    })
  ]
});
