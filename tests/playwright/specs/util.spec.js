/**
 * BOLDGRID.EDITOR.Util.convertPxToEm (ported from the Karma suite).
 */
const { test, expect } = require( '@playwright/test' );
const { openHarness, sourcePath } = require( '../lib/harness' );

test.describe( 'Pixels to Ems calculations', () => {
	test.beforeEach( async ( { page } ) => {
		await openHarness( page );
		await page.addScriptTag( { path: sourcePath( 'assets/js/builder/util.js' ) } );
	} );

	const cases = [
		[ 'produces a number less than 1', 15, 17, '0.9' ],
		[ 'produces a number more than 1', 199, 17, '11.7' ],
		[ 'results in 0', 0, 17, 0 ],
		[ 'both arguments 0', 0, 0, 0 ],
	];

	for ( const [ title, px, fontSize, expected ] of cases ) {
		test( title, async ( { page } ) => {
			const ems = await page.evaluate(
				( [ a, b ] ) => window.BOLDGRID.EDITOR.Util.convertPxToEm( a, b ),
				[ px, fontSize ],
			);

			expect( ems ).toBe( expected );
		} );
	}
} );
