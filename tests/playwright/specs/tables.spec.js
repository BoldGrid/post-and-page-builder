/**
 * Table heading labels stay text (ported from the Karma suite).
 */
const { test, expect } = require( '@playwright/test' );
const { openHarness, sourcePath } = require( '../lib/harness' );

const HEADING_LABEL = 'Quarterly "A&B" <strong>Draft</strong>';

test.describe( 'Table heading labels', () => {
	test.beforeEach( async ( { page } ) => {
		await openHarness( page );
		await page.evaluate( () => {
			window.__ppbRegistered = [];
			window.BOLDGRID = {
				EDITOR: {
					CONTROLS: {},
					Controls: {
						registerControl: ( control ) => window.__ppbRegistered.push( control.name ),
					},
				},
			};
		} );
		await page.addScriptTag( {
			path: sourcePath( 'assets/js/builder/controls/element/tables.js' ),
		} );
		await page.evaluate( () => {
			const $ = window.jQuery;

			window.$ppbPanel = $( '<div><div class="section-heading-labels"></div></div>' );
			window.$ppbTable = $(
				'<table><thead><tr><th></th></tr></thead><tbody><tr><td></td></tr></tbody></table>',
			);
			window.BOLDGRID.EDITOR.Panel = { $element: window.$ppbPanel };
			window.BOLDGRID.EDITOR.Menu = { getTarget: () => window.$ppbTable };
		} );
	} );

	test( 'registers the control', async ( { page } ) => {
		expect( await page.evaluate( () => window.__ppbRegistered ) ).toEqual( [ 'tables' ] );
	} );

	test( 'preserves heading label text when building the input', async ( { page } ) => {
		const result = await page.evaluate( ( label ) => {
			window.$ppbTable.find( 'th' ).attr( 'data-label', label );
			window.BOLDGRID.EDITOR.CONTROLS.Tables._setupChangeHeadingLabels();

			return {
				strong: window.$ppbPanel.find( '.section-heading-labels strong' ).length,
				value: window.$ppbPanel.find( 'input[name="heading-label-0"]' ).val(),
			};
		}, HEADING_LABEL );

		expect( result.strong ).toBe( 0 );
		expect( result.value ).toBe( HEADING_LABEL );
	} );

	test( 'stores heading labels through the attribute API', async ( { page } ) => {
		const result = await page.evaluate( ( label ) => {
			const $input = window.jQuery( '<input>' ).data( 'heading-index', 0 ).val( label );

			window.BOLDGRID.EDITOR.CONTROLS.Tables._bindHeadingLabels.call( $input.get( 0 ) );

			return {
				th: window.$ppbTable.find( 'th' ).attr( 'data-label' ),
				td: window.$ppbTable.find( 'td' ).attr( 'data-label' ),
			};
		}, HEADING_LABEL );

		expect( result.th ).toBe( HEADING_LABEL );
		expect( result.td ).toBe( HEADING_LABEL );
	} );
} );
