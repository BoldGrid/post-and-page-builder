const path = require( 'path' );
const webpack = require( 'webpack' );
const HtmlWebpackPlugin = require( 'html-webpack-plugin' );
const ExtractTextPlugin = require( 'extract-text-webpack-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const MinifyPlugin = require( 'babel-minify-webpack-plugin' );

const srcDir = path.resolve( __dirname, '../..' );
const distDir = path.resolve( __dirname, '../..' );
const nodeModules = path.resolve( __dirname, '../../node_modules' );
const fontsDir = distDir + '/assets/fonts/';
const jsonDir = distDir + '/assets/json/';
const cssDir = distDir + '/assets/css/';
const scssDir = distDir + '/assets/scss/';

module.exports = {
	mode: 'production',

	context: srcDir,

	entry: {
		public: './assets/js/public.js',
		editor: './assets/js/editor.js',
		gutenberg: './assets/js/gutenberg.js',
		classic: './assets/js/classic.js',
		settings: './assets/js/settings.js'
	},

	output: {
		filename: './assets/js/[name].min.js',
		path: distDir + './assets/dist',
		publicPath: '/'
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
				test: /\.svg$/,
				loader: 'svg-inline-loader'
			},
			{
				test: /\.js$/,
				use: [ 'babel-loader' ]
			},
			{
				test: /\.js$/,
				enforce: 'pre',
				exclude: /node_modules/,
				loader: 'eslint-loader',
				options: {
					emitWarning: true
				}
			},
			{
				test: /\.(scss|css)$/,
				use: ExtractTextPlugin.extract( {
					fallback: 'style-loader',
					use: [
						{
							loader: 'css-loader',
							options: {
								minimize: true
							}
						},
						{
							loader: 'sass-loader',
							options: {
								includePaths: [ nodeModules ]
							}
						},
						{
							loader: 'postcss-loader',
							options: {
								plugins: ( loader ) => [
									require( 'autoprefixer' )
								]
							}
						}
					]
				} )
			},
			{
				test: /\.(jpg|jpeg|png|gif|ico)$/,
				loader: 'url-loader',
				query: {
					limit: 10000, // Use data url for assets <= 10KB
					name: 'static/[name].[hash].[ext]'
				}
			}
		]
	},

	plugins: [
		new MinifyPlugin(),

		new webpack.NamedModulesPlugin(),

		new CopyWebpackPlugin( [
			{
				from: require.resolve( 'jquery.stellar/jquery.stellar.js' ),
				to: distDir + '/assets/js/jquery-stellar'
			},
			{
				from: srcDir + '/node_modules/font-awesome/fonts',
				to: fontsDir,
				ignore: [ 'fontawesome-webfont.svg' ]
			},
			{
				from: require.resolve( 'font-awesome/css/font-awesome.min.css' ),
				to: cssDir
			},
			{
				from: require.resolve( '@boldgrid/controls/dist/static/sass.worker.js' ),
				to: distDir + '/assets/js/sass-js'
			},
			{
				from: require.resolve( '@boldgrid/components/dist/css/components.min.css' ),
				to: cssDir
			},
			{
				from: require.resolve( '@boldgrid/components/dist/css/components.css' ),
				to: cssDir
			},
			{
				from: require.resolve( 'animate.css/animate.css' ),
				to: cssDir
			},
			{
				from: require.resolve( 'animate.css/animate.min.css' ),
				to: cssDir
			},
			{
				from: require.resolve( '@boldgrid/controls/src/controls/typography/family/google-fonts.json' ),
				to: jsonDir
			},
			{
				from: 'node_modules/@boldgrid/controls/dist/scss/color-palette-scss',
				to: path.resolve( scssDir, 'color-palette-scss' )
			}
		] ),

		new webpack.ProvidePlugin( {
			$: 'jquery',
			jQuery: 'jquery'
		} ),

		new ExtractTextPlugin( 'assets/css/bundle.min.css' )
	]
};
