const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { BuildFilesMetaPlugin } = require('./BuildFilesMetaPlugin');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const modes = isProd ? [true, false] : [false];

  // 2 configurations will be compiled in parallel
  return modes.map(isLegacy => {
    const filename = `${isProd ? '[contenthash].' : ''}[name]${isLegacy ? '_legacy' : ''}`;
    const chunkName = `${isProd ? '[contenthash].' : ''}[id]${isLegacy ? '_legacy' : ''}`;
    const babelOptions = require('./babelConifg.json')[isLegacy ? 'legacy' : 'modern'];

    return {
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
        new BuildFilesMetaPlugin({
          filename: `./${isLegacy ? 'legacy' : 'modern'}-meta.js`,
        }),
        !isLegacy && new CopyPlugin({
          patterns: [
            { from: './public' },
          ],
        }),
        new MiniCssExtractPlugin({
          filename: `${filename}.css`,
          chunkFilename: `${chunkName}.css`,
        }),
      ].filter(Boolean),
      devServer: {
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
