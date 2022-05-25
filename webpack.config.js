const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {
  CleanWebpackPlugin
} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const ImageMinimizerPlugin = require("image-minimizer-webpack-plugin");
const autoprefixer = require('autoprefixer');
const postcss = require('postcss');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;

function optimization() {
  const configObj = {
    splitChunks: {
      chunks: 'all',
    },
  };

  if (isProd) {
    configObj.minimizer = [
      new CssMinimizerPlugin(),
      new TerserPlugin()
    ]
  }

  return configObj;
};

function pluginsConfig() {
  const basePlugins = [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src/index.html'),
      filename: 'index.html',
      minify: {
        collapseWhitespace: isProd
      },
      title: 'Coin.',
    }),
    new MiniCssExtractPlugin({
      filename: `./css/${filename('css')}`,
    }),
  ];

  if (isProd) {
    basePlugins.push(
      new ImageMinimizerPlugin({
        minimizer: {
          implementation: ImageMinimizerPlugin.imageminMinify,
          options: {
            plugins: [
              ["jpegtran", {
                progressive: true
              }],
              ["optipng", {
                optimizationLevel: 5
              }],
            ],
          },
        },
      }),
    );
  }

  return basePlugins;
};

module.exports = {
  context: path.resolve(__dirname, 'src'),
  entry: ['babel-polyfill', './js/main.js'],
  mode: 'development',
  output: {
    filename: `./js/${filename('js')}`,
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/',
    clean: true,
  },
  devtool: isProd ? false : 'source-map',
  module: {
    rules: [{
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }, {
        test: /\.(|woff2|woff)$/i,
        type: 'asset/resource',
        generator: {
          filename: `./fonts/${filename('[ext]')}`
        },
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: `./img/${filename('[ext]')}`
        },
      },
      {
        test: /\.(sa|sc|c)ss$/i,
        use: [
          isProd ? MiniCssExtractPlugin.loader : 'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  [autoprefixer({
                    browsers: ['> 1%']
                  })]
                ],
              },
            }
          },
          'sass-loader',
        ],
      },
    ]
  },
  optimization: optimization(),
  plugins: pluginsConfig(),
  devServer: {
    historyApiFallback: true,
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    open: true,
    compress: true,
    hot: true,
    port: 3000,
  },
};
