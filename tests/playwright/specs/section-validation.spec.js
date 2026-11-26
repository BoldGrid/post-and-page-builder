/**
 * BOLDGRID.EDITOR.VALIDATION.Section: content under div.row is wrapped in a
 * column without turning entity-encoded text into live markup.
 *
 * Runs against the source module and the module shipped in
 * assets/dist/editor.min.js.
 */
const { test, expect } = require( '@playwright/test' );
const { extractWebpackModule, openHarness, readSource } = require( '../lib/harness' );

const COLUMN = 'col-lg-12 col-md-12 col-xs-12 col-sm-12';

const ENCODED_MARKUP = '&lt;img src=x onerror="window.__ppbMarker=1"&gt;';
const DECODED_MARKUP = '<img src=x onerror="window.__ppbMarker=1">';

const loaders = {
	source: () => readSource( 'assets/js/builder/validation/section.js' ),
	dist: () => {
		const bundle = readSource( 'assets/dist/editor.min.js' );
		const module = extractWebpackModule( bundle, 'VALIDATION.Section={}' );

		return `(${ module })({}, {}, function() { return window.jQuery; });`;
	},
};

/**
 * Run Section.updateContent() on markup inside #ppb-context.
 *
 * @param {import('@playwright/test').Page} page   Playwright page.
 * @param {string}                          markup Saved post markup.
 */
async function updateContent( page, markup ) {
	await page.evaluate( ( html ) => {
		window.BoldgridEditor = { default_container: 'container' };

		const $context = window.jQuery( '#ppb-context' );
		$context.html( html );
		window.BOLDGRID.EDITOR.VALIDATION.Section.updateContent( $context );
	}, markup );
}

/**
 * Wait until a broken image outside the context has fired onerror, so any
 * image created by updateContent() has had the same chance to fire.
 *
 * @param {import('@playwright/test').Page} page Playwright page.
 */
async function flushImageErrors( page ) {
	await page.evaluate( () => {
		const sentinel = document.createElement( 'img' );
		sentinel.onerror = () => {
			window.__ppbSentinel = 1;
		};
		sentinel.src = '/ppb-sentinel.png';
		document.body.appendChild( sentinel );
	} );
	await page.waitForFunction( () => 1 === window.__ppbSentinel );
}

for ( const [ name, load ] of Object.entries( loaders ) ) {
	test.describe( `Section validation (${ name })`, () => {
		test.beforeEach( async ( { page } ) => {
			await openHarness( page );
			await page.addScriptTag( { content: load() } );
			expect(
				await page.evaluate( () => typeof window.BOLDGRID.EDITOR.VALIDATION.Section.updateContent ),
			).toBe( 'function' );
		} );

		test( 'entity-encoded markup in h1 > ins > p stays text', async ( { page } ) => {
			await updateContent(
				page,
				`<div class="row"><h1><ins><p>${ ENCODED_MARKUP }</p></ins></h1></div>`,
			);
			await flushImageErrors( page );

			expect( await page.locator( '#ppb-context img' ).count() ).toBe( 0 );
			expect( await page.evaluate( () => window.__ppbMarker ) ).toBeUndefined();

			const heading = page.locator( '#ppb-context h1' );
			await expect( heading ).toHaveCount( 1 );
			expect( await heading.textContent() ).toBe( DECODED_MARKUP );
		} );

		test( 'entity-encoded markup in h3 > ins > p stays text', async ( { page } ) => {
			await updateContent(
				page,
				`<div class="row"><h3><ins><p>${ ENCODED_MARKUP }</p></ins></h3></div>`,
			);
			await flushImageErrors( page );

			expect( await page.locator( '#ppb-context img' ).count() ).toBe( 0 );
			expect( await page.evaluate( () => window.__ppbMarker ) ).toBeUndefined();

			const heading = page.locator( '#ppb-context h3' );
			await expect( heading ).toHaveCount( 1 );
			expect( await heading.textContent() ).toBe( DECODED_MARKUP );
		} );

		test( 'h1 > p under div.row is wrapped in a column and keeps its text', async ( { page } ) => {
			await updateContent(
				page,
				'<div class="row"><h1 class="legacy"><p>Welcome to our site</p></h1></div>',
			);

			const heading = page.locator( `#ppb-context .row > div.${ COLUMN.split( ' ' ).join( '.' ) } > h1` );
			await expect( heading ).toHaveCount( 1 );
			expect( await heading.getAttribute( 'class' ) ).toBeNull();
			expect( await heading.locator( 'p' ).count() ).toBe( 0 );
			expect( await heading.textContent() ).toBe( 'Welcome to our site' );
			await expect( page.locator( '#ppb-context .boldgrid-section > .container > .row' ) ).toHaveCount( 1 );
		} );

		test( 'h1 > p under div.row keeps inline formatting', async ( { page } ) => {
			await updateContent(
				page,
				'<div class="row"><h1><p>Welcome to <strong>our</strong> <em>site</em></p></h1></div>',
			);

			const heading = page.locator( '#ppb-context .row > div > h1' );
			await expect( heading ).toHaveCount( 1 );
			expect( await heading.innerHTML() ).toBe( 'Welcome to <strong>our</strong> <em>site</em>' );
		} );

		test( 'h2 without an inner p under div.row is wrapped in a column and keeps its content', async ( { page } ) => {
			await updateContent(
				page,
				'<div class="row"><h2>Our <strong>services</strong> and <em>prices</em></h2></div>',
			);

			const heading = page.locator( `#ppb-context .row > div.${ COLUMN.split( ' ' ).join( '.' ) } > h2` );
			await expect( heading ).toHaveCount( 1 );
			expect( await heading.innerHTML() ).toBe( 'Our <strong>services</strong> and <em>prices</em>' );
		} );

		test( 'p without an inner p under div.row is wrapped in a column and keeps its content', async ( { page } ) => {
			await updateContent(
				page,
				'<div class="row"><p>Plain <a href="/about">text</a> here</p></div>',
			);

			const paragraph = page.locator( `#ppb-context .row > div.${ COLUMN.split( ' ' ).join( '.' ) } > p` );
			await expect( paragraph ).toHaveCount( 1 );
			expect( await paragraph.innerHTML() ).toBe( 'Plain <a href="/about">text</a> here' );
		} );

		// Every element in contentSelector goes through the same code path.
		for ( const tag of [ 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7', 'p' ] ) {
			test( `${ tag } without an inner p keeps its content`, async ( { page } ) => {
				await updateContent(
					page,
					`<div class="row"><${ tag }>Keep <strong>this</strong></${ tag }></div>`,
				);

				const element = page.locator( `#ppb-context .row > div > ${ tag }` );
				await expect( element ).toHaveCount( 1 );
				expect( await element.innerHTML() ).toBe( 'Keep <strong>this</strong>' );
			} );

			// A p cannot hold another p, so only the heading levels have the inner p case.
			if ( 'p' !== tag ) {
				test( `entity-encoded markup in ${ tag } > p stays text`, async ( { page } ) => {
					await updateContent(
						page,
						`<div class="row"><${ tag }><p>${ ENCODED_MARKUP }</p></${ tag }></div>`,
					);
					await flushImageErrors( page );

					expect( await page.locator( '#ppb-context img' ).count() ).toBe( 0 );
					expect( await page.evaluate( () => window.__ppbMarker ) ).toBeUndefined();
					expect( await page.locator( `#ppb-context ${ tag }` ).textContent() ).toBe( DECODED_MARKUP );
				} );
			}
		}
	} );
}
