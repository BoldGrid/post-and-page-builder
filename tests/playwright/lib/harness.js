/**
 * Self-contained browser harness for builder modules.
 *
 * Serves a blank page from a fake origin and answers every other request with
 * a local 404, so no request leaves the machine and no WordPress site is used.
 *
 * PPB_SOURCE_ROOT points the harness at another checkout or `git archive`
 * export (for example the pre-fix commit) instead of this one.
 */
const fs = require( 'fs' );
const path = require( 'path' );

const PLUGIN_ROOT = path.resolve( __dirname, '../../..' );
const SOURCE_ROOT = process.env.PPB_SOURCE_ROOT
	? path.resolve( process.env.PPB_SOURCE_ROOT )
	: PLUGIN_ROOT;
const ORIGIN = 'http://ppb.test';
const PAGE =
	'<!doctype html><html><head><meta charset="utf-8"><title>PPB harness</title></head>' +
	'<body><div id="ppb-context"></div></body></html>';

const sourcePath = ( relative ) => path.join( SOURCE_ROOT, relative );

const readSource = ( relative ) => fs.readFileSync( sourcePath( relative ), 'utf8' );

/**
 * Open the harness page with jQuery loaded.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 */
async function openHarness( page ) {
	await page.route( '**/*', ( route ) => {
		const url = new URL( route.request().url() );

		if ( ORIGIN === url.origin && '/' === url.pathname ) {
			return route.fulfill( { contentType: 'text/html', body: PAGE } );
		}

		return route.fulfill( { status: 404, contentType: 'text/plain', body: '' } );
	} );

	await page.goto( ORIGIN + '/' );
	await page.addScriptTag( { path: require.resolve( 'jquery/dist/jquery.js' ) } );
}

/**
 * Return the end index (exclusive) of the block that opens at `start`.
 *
 * Skips string literals so braces inside markup strings are not counted.
 *
 * @param {string} source Source text.
 * @param {number} start  Index of the opening brace.
 * @return {number} Index after the matching closing brace.
 */
function matchBrace( source, start ) {
	let depth = 0;

	for ( let i = start; i < source.length; i++ ) {
		const char = source[ i ];

		if ( '"' === char || "'" === char || '`' === char ) {
			for ( i++; i < source.length && source[ i ] !== char; i++ ) {
				if ( '\\' === source[ i ] ) {
					i++;
				}
			}
		} else if ( '{' === char ) {
			depth++;
		} else if ( '}' === char ) {
			depth--;

			if ( 0 === depth ) {
				return i + 1;
			}
		}
	}

	throw new Error( 'Unbalanced braces in bundle.' );
}

/**
 * Extract one webpack module function from a production bundle.
 *
 * @param {string} bundle Bundle source.
 * @param {string} marker Text that only appears inside the wanted module.
 * @return {string} Source of `function(t,e,n){...}`.
 */
function extractWebpackModule( bundle, marker ) {
	const markerIndex = bundle.indexOf( marker );

	if ( -1 === markerIndex ) {
		throw new Error( `Marker not found in bundle: ${ marker }` );
	}

	const header = /\d+:function\(\w+,\w+,\w+\)\{/g;
	let start = -1,
		match;

	while ( ( match = header.exec( bundle ) ) && match.index < markerIndex ) {
		start = match.index + match[ 0 ].indexOf( 'function' );
	}

	if ( -1 === start ) {
		throw new Error( 'Module header not found before marker.' );
	}

	return bundle.slice( start, matchBrace( bundle, bundle.indexOf( '{', start ) ) );
}

module.exports = {
	ORIGIN,
	PLUGIN_ROOT,
	SOURCE_ROOT,
	extractWebpackModule,
	openHarness,
	readSource,
	sourcePath,
};
