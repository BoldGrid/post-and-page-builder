/**
 * Automatically Copies Deps from Framework:
 * FontAwesome
 * jquery-stellar
 * components.css
 * bootstrap.min.css
 * font-family-controls.min.css
 */

const { error } = require('console');

var gulp = require( 'gulp' ),
	cssnano = require( 'gulp-cssnano' ),
	rename = require( 'gulp-rename' ),
	sass = require('gulp-sass')(require('sass')),
	uglify = require( 'gulp-uglify' ),
	concat = require( 'gulp-concat' ),
	fs = require( 'fs' ),
	autoprefixer = require( 'gulp-autoprefixer' ),
	pump = require( 'pump' );

// Configs.
var config = {
	src: './',
	dist: './',
	fontDest: './assets/fonts',
	buildDest: './build',
	cssDest: './assets/css',
	jsDest: './assets/js',
	jsonDir: './assets/json'
};

// Update google fonts css.
gulp.task( 'fontFamilyCss', () => {
	let fileContent = fs.readFileSync( config.src + '/assets/json/google-fonts.json', 'utf8' ),
		webFonts = JSON.parse( fileContent ).items,
		outFilename = config.cssDest + '/font-family-controls.min.css',
		css = '',
		index = 0;

	for ( let font in webFonts ) {
		position = 0 === index ? 0 : ( index * -41.423841059602649006622516556291 ) - 5,
		classname = webFonts[font].family.replace( /\s+/g, '-' ).toLowerCase();

		css += '.bgcon-google-font.' + classname + '{background-position:0 ' + position + 'px;}';
		console.log( {
			family: webFonts[font].family,
			index: index,
			position: position
		} );
		index++;
	}

	console.log( 'Font Count: ' + index );

	fs.writeFileSync( outFilename, css );
} );


// Compile sass files.
gulp.task( 'sass', function( cb ) {
	gulp
		.src( [
			config.dist + '/assets/scss/**/*.scss',
			'!' + config.src + 'assets/scss/color-palette-scss/**/*'
		] )
		.pipe(
			sass( {
				includePaths: [ config.dist + 'assets/scss/' ]
			} ).on( 'error', sass.logError )
		)
		.pipe( sass.sync().on( 'error', sass.logError ) )
		.pipe(
			autoprefixer( {
				browsers: [ '> 1%', 'Last 2 versions' ],
				cascade: false
			} )
		)
		.pipe( gulp.dest( config.dist + '/assets/css' ) )
		.pipe(
			cssnano( {
				discardComments: { removeAll: true },
				safe: true,
				zindex: false
			} )
		)
		.pipe( rename( { suffix: '.min' } ) )
		.pipe( gulp.dest( config.dist + '/assets/css' ) );
		cb();
} );

gulp.task( 'jsmin-media', function( cb ) {
	pump(
		[
			gulp.src( [
				'!' + config.src + 'assets/js/media/**/*.min.js',
				config.src + 'assets/js/media/**/*.js'
			] ),
			uglify(),
			rename( {
				suffix: '.min'
			} ),
			gulp.dest( config.dist + 'assets/js/media' )
		],
		cb
	);
} );

gulp.task( 'jsmin-editor', function( cb ) {
	pump(
		[
			gulp.src( [
				'!' + config.src + 'assets/js/editor/**/*.min.js',
				config.src + 'assets/js/editor/**/*.js'
			] ),
			uglify(),
			rename( {
				suffix: '.min'
			} ),
			gulp.dest( config.dist + 'assets/js/editor' )
		],
		cb
	);
} );

gulp.task( 'build', gulp.series( 'sass', 'jsmin-editor', 'jsmin-media' ) );

gulp.task( 'watch', function() {
	gulp.watch( config.src + 'assets/scss/**/*', [ 'sass' ] );
} );
