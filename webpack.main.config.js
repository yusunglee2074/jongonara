const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');

const baseConfig = require('./webpack.base.config');

module.exports = merge.smart(baseConfig, {
    mode: "development",
    target: 'electron-main',
    entry: {
        main: './src/main.ts'
    },
    externals: {
        'bufferutil': 'commonjs bufferutil',
        'utf-8-validate': 'commonjs utf-8-validate',
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                include: [
                    path.resolve(__dirname, 'src', 'main.ts'),
                    path.resolve(__dirname, 'src', 'ipc', 'main-IPC.ts'),
                    path.resolve(__dirname, 'src', 'ipc', 'renderer-IPC.ts'),
                    path.resolve(__dirname, 'src', 'utils', 'constants.ts'),
                ],
                loader: 'awesome-typescript-loader'
            }
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
        })
    ]
});
