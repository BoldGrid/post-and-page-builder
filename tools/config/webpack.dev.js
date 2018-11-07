const path = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const config = require( './local.dev.js' );

const distDir = path.resolve( __dirname, '../..' );
const srcDir = path.resolve( __dirname, '../..' );

var webpackConfig = {
	mode: 'development',

	context: srcDir,

	entry: {
		public: './assets/js/public.js',
		editor: './assets/js/editor.js',
		gutenberg: './assets/js/gutenberg.js',
		classic: './assets/js/classic.js',
		settings: './assets/js/settings.js'
	},
	output: {
		filename: './[name].js',
		path: distDir + './assets/dist',
		publicPath: '/'
	},

	devServer: {
		contentBase: path.resolve( __dirname, '../..' ),
		publicPath: '/',
		historyApiFallback: true,
		port: 4000,
		overlay: {
			errors: true,
			warnings: true
		}
	},

	externals: {
		jquery: 'jQuery'
	},

	module: {
		rules: [
			{
				test: /\.ejs$/,
				loader: 'ejs-loader'
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							minimize: true
						}
					}
				]
			},
			{
				test: /\.js$/,
				loader: 'babel-loader'
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					configFile: srcDir + '/.eslintrc.js',
					emitWarning: true
				}
			},
			{
				test: /\.(scss|css)$/,
				use: [
					{
						loader: 'style-loader'
					},
					{
						loader: 'css-loader'
					},
					{
						loader: 'sass-loader',
						options: {
							includePaths: [ 'node_modules' ]
						}
					}
				]
			},
			{
				test: /\.(jpg|jpeg|png|gif|ico)$/,
				loader: 'url-loader',
				query: {
					limit: 10000, // Use data url for assets <= 10KB
					name: 'static/images/[name].[hash].[ext]'
				}
			}
		]
	},

	plugins: [
		new webpack.HotModuleReplacementPlugin(),

		new webpack.NamedModulesPlugin(),

		new webpack.ProvidePlugin( {
			$: 'jquery',
			jQuery: 'jquery'
		} )
	]
};

if ( config.devServer.proxy ) {
	webpackConfig.devServer.proxy = config.devServer.proxy;
}

module.exports = webpackConfig;
