const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const fs = require('fs');
const { StatsPlugin } = require('./StatsPlugin');

fs.mkdirSync('build');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';

  // 2 configurations will be compiled in parallel
  return [true, false].map(isLegacy => {
    const filename = `${isProd ? '[hash].' : ''}[name]${isLegacy ? '_legacy' : ''}`;
    const chunkName = `${isProd ? '[hash].' : ''}[id]${isLegacy ? '_legacy' : ''}`;
    const babelOptions = require('./babelConifg.json')[isLegacy ? 'legacy' : 'modern'];

    return {
      name: isLegacy ? 'legacy' : 'modern',
      dependencies: isLegacy ? undefined : ['legacy'],
      mode: isProd ? 'production' : 'development',
      devtool: isProd ? false : 'inline-source-map',
      entry: './src/index.js',
      output: {
        path: path.join(__dirname, 'build'),
        filename: `${filename}.js`,
        chunkFilename: `${chunkName}.js`,
      },
      target: ['web', isLegacy ? 'es5' : 'es6'],
      module: {
        rules: [{
          test: /\.jsx?$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
          options: babelOptions,
        }, {
          test: /\.svg$/,
          loader: 'svg-url-loader',
        }, {
          test: /\.css$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            {
              loader: 'postcss-loader',
              options: {
                postcssOptions: {
                  plugins: [
                    require('autoprefixer')({
                      overrideBrowserslist: babelOptions.presets[0][1].targets,
                      grid: true,
                      // clean: true,
                    }),
                  ]
                }
              }
            }
          ],
        }],
      },
      resolve: {
        extensions: ['.js', '.ts', '.tsx', '.jsx'],
      },
      plugins: [
        new StatsPlugin({
          filename: `./build/${isLegacy ? 'legacy' : 'modern'}-stats.json`,
          ...(!isLegacy && {
            legacyFilename: './build/legacy-stats.json',
          }),
        }),
        !isLegacy && new CopyPlugin({
          patterns: [
            { from: './public' },
          ],
        }),
        !isLegacy && new HTMLPlugin({
          template: './src/template.ejs',
          excludeChunks: ['main'],
          minify: {
            removeStyleLinkTypeAttributes: true,
            removeScriptTypeAttributes: true,
            removeRedundantAttributes: true,
            collapseWhitespace: true,
            useShortDoctype: true,
            removeComments: true,
            minifyCSS: true,
            minifyJS: true,
          }
        }),
        new MiniCssExtractPlugin({
          filename: `${filename}.css`,
          chunkFilename: `${chunkName}.css`,
        }),
      ].filter(Boolean),
      devServer: isLegacy ? undefined : {
        open: true,
      },
      optimization: {
        splitChunks: {
          cacheGroups: {
            defaultVendors: {
              name: 'vendors',
              test: /react/,
              chunks: 'all',
            },
          },
        },
        minimizer: [
          new TerserPlugin({
            minify: TerserPlugin.swcMinify,
          }),
        ],
      },
    };
  });
};
