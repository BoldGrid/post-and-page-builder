describe( 'Table heading labels', function() {
	var tables,
		$panel,
		$table;

	beforeAll( function() {
		window.BOLDGRID = {
			EDITOR: {
				CONTROLS: {},
				Controls: {
					registerControl: jasmine.createSpy( 'registerControl' )
				}
			}
		};

		require( '../../../assets/js/builder/controls/element/tables.js' );
		tables = BOLDGRID.EDITOR.CONTROLS.Tables;
	} );

	beforeEach( function() {
		$panel = $( '<div><div class="section-heading-labels"></div></div>' );
		$table = $(
			'<table><thead><tr><th></th></tr></thead><tbody><tr><td></td></tr></tbody></table>'
		);

		BOLDGRID.EDITOR.Panel = {
			$element: $panel
		};
		BOLDGRID.EDITOR.Menu = {
			getTarget: function() {
				return $table;
			}
		};
	} );

	it( 'preserves heading label text when building the input', function() {
		var headingLabel = 'Quarterly "A&B" <strong>Draft</strong>';

		$table.find( 'th' ).attr( 'data-label', headingLabel );
		tables._setupChangeHeadingLabels();

		expect( $panel.find( '.section-heading-labels strong' ).length ).toBe( 0 );
		expect( $panel.find( 'input[name="heading-label-0"]' ).val() ).toBe( headingLabel );
	} );

	it( 'stores heading labels through the attribute API', function() {
		var headingLabel = 'Quarterly "A&B" <strong>Draft</strong>',
			$input = $( '<input>' )
				.data( 'heading-index', 0 )
				.val( headingLabel );

		tables._bindHeadingLabels.call( $input.get( 0 ) );

		expect( $table.find( 'th' ).attr( 'data-label' ) ).toBe( headingLabel );
		expect( $table.find( 'td' ).attr( 'data-label' ) ).toBe( headingLabel );
	} );
} );
