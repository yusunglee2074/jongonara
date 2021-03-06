'use strict';

const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const CssUrlRelativePlugin = require('css-url-relative-plugin')

module.exports = {
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    },
    node: {
        __dirname: false,
        __filename: false
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js', '.json']
    },
    devtool: 'source-map',
    plugins: [
        new CssUrlRelativePlugin(),
        new CopyWebpackPlugin([ { from: 'src/public', to: 'public' }, ]),
    ]
};
