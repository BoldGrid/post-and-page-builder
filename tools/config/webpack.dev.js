const path = require( 'path' );
const webpack = require( 'webpack' );
const MiniCssExtractPlugin = require( 'mini-css-extract-plugin' );
const CopyWebpackPlugin = require( 'copy-webpack-plugin' );
const RemovePlugin = require('remove-files-webpack-plugin');

const srcDir = path.resolve( __dirname, '../..' );
const distDir = path.resolve( __dirname, '../..' );
const fontsDir = distDir + '/assets/fonts/';
const jsonDir = distDir + '/assets/json/';
const cssDir = distDir + '/assets/css/';
const scssDir = distDir + '/assets/scss/';

module.exports = {
	mode: 'development',

	context: srcDir,

	cache: true,

	resolve: {
		extensions: [ '', '.js', '.jsx' ],
	},

	entry: {
		public: './assets/js/public.js',
		editor: './assets/js/editor.js',
		gutenberg: './assets/js/gutenberg.js',
		classic: './assets/js/classic.js',
		settings: './assets/js/settings.js'
	},

	optimization: {
		moduleIds: 'named',
	},

	output: {
		filename: './assets/dist/[name].min.js',
		path: distDir,
		publicPath: '/',
		assetModuleFilename: 'static/[name][ext][query]'
	},

	externals: {
		jquery: 'jQuery'
	},

	module: {
		rules: [
			{
				test: /\.m?js/,
				resolve: {
					fullySpecified: false
				}
			},
			{
				test: /\.html$/,
				use: [
					{
						loader: 'html-loader',
						options: {
							sources: false,
							esModule: false,
						}
					}
				]
			},
			{
				test: /\.svg$/,
				loader: 'svg-inline-loader',
			},
			{
				test: /\.(js|jsx)$/,
				use: ['babel-loader'],
				resolve: {
					extensions: [".js", ".jsx"]
				},
				include: [ srcDir ],
			},
			{
				test: /\.(scss|css)$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader',
					{
						loader: 'sass-loader',
						options: {
							implementation: require.resolve( 'sass' ),
						},
					},
					'postcss-loader'
				],
			},
			{
				test: /\.(jpg|jpeg|png|gif|ico)$/,
				type: 'asset',
			}
		]
	},

	plugins: [
		new CopyWebpackPlugin({
			patterns: [
			{
				from: require.resolve( 'jquery.stellar/jquery.stellar.js' ),
				to: distDir + '/assets/js/jquery-stellar'
			},
			{
				from: srcDir + '/node_modules/font-awesome/fonts',
				to: fontsDir,
				globOptions: {
					ignore: [ '**/fontawesome-webfont.svg' ],
				}
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
			]
		} ),

		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
		} ),

		new MiniCssExtractPlugin( {
			filename: 'assets/dist/[name].min.css',
		} ),

		new RemovePlugin({
			after: {
				test: [
					{
						folder: srcDir,
						method: (absoluteItemPath) => {
							if ( absoluteItemPath.includes( 'node_modules' ) ) {
								return false;
							}
							if ( absoluteItemPath.includes( 'vendor' ) ) {
								return false;
							}
							return new RegExp(/\.LICENSE\.txt$/, 'mi').test( absoluteItemPath );
						},
						recursive: true
					},
					{
						folder: srcDir,
						method: (absoluteItemPath) => {
							if ( absoluteItemPath.includes( 'node_modules' ) ) {
								return false;
							}
							if ( absoluteItemPath.includes( 'vendor' ) ) {
								return false;
							}
							return new RegExp( /\/static/, 'mi' ).test( absoluteItemPath );
						},
						recursive: true

					},
					{
						folder: srcDir,
						method: (absoluteItemPath) => {
							if ( absoluteItemPath.includes( 'node_modules' ) ) {
								return false;
							}
							if ( absoluteItemPath.includes( 'vendor' ) ) {
								return false;
							}
							return new RegExp(/\.png$/, 'mi').test( absoluteItemPath );
						},
						recursive: false
					},
				],
			}
		}),
	],
	stats: {
		builtAt: true,
		moduleAssets: false,
		colors: true,
		errorDetails: true,
	},
	watch: true
};
