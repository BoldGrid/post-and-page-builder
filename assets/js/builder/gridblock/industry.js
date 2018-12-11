var BGGB = BOLDGRID.EDITOR.GRIDBLOCK,
	$ = jQuery;

export class Industry {

	/**
	 * Bind Events and find element.
	 *
	 * @since 1.7.0
	 */
	init() {

		/*
		 * If the user has a saved industry and it matches one of the industries returned in the API, use it.
		 * Otherwise use the following default.
		 */
		this.defaults = { selection: 'photography' };
		this.state = 'pending';
		this.$selectWrap = BGGB.View.$gridblockNav.find( '.boldgrid-gridblock-industry' );
		this.$select = this.$selectWrap.find( 'select' );

		this._fetch();
	}

	/**
	 * Update the UI's filter attribute.
	 *
	 * @since 1.7.0
	 */
	setFilterVal() {
		BGGB.View.$gridblockSection.find( '.gridblocks' ).attr( 'industry', this.getSelected() );
	}

	/**
	 * Get the currently selected industry.
	 *
	 * @since 1.7.0
	 *
	 * @return {string} Get selected.
	 */
	getSelected() {
		return this.$select.val() || this.defaults.selection;
	}

	/**
	 * Create select menu options.
	 *
	 * @since 1.7.0
	 *
	 * @param  {array} options Options.
	 * @return {string}        Menu Options.
	 */
	createSelectOptions( options ) {
		let html = '';

		for ( let option of options ) {
			html += `<option value="${option.slug}">${option.title}</option>`;
		}

		return html;
	}

	/**
	 * Show the filters section if all filters have been retrieved.
	 *
	 * @since 1.7.0
	 */
	showFilters() {
		if ( 'complete' === this.state && BGGB.View.finishedTypeFetch ) {
			BGGB.View.$filterSelectWrap.fadeIn();
		}
	}

	/**
	 * Get available industries from the remote.
	 *
	 * @since 1.7.0
	 */
	_fetch() {
		this.state = 'loading';
		BGGB.Generate.gridblockLoadingUI.start();

		return (
			$.ajax( {
				type: 'get',
				url:
					BoldgridEditor.plugin_configs.asset_server +
					BoldgridEditor.plugin_configs.ajax_calls.gridblock_industries,
				dataType: 'json',
				timeout: 20000
			} )

				// On success, create select menu.
				.done( response => {
					this.$select.html( this.createSelectOptions( response ) );
					this._setDefault();
					this.$selectWrap.show();
					this._onSelectChange();
				} )

				// Afterwards even on fail, set the html attribute and fire fetch blocks.
				.always( () => {
					this.setFilterVal();
					this.state = 'complete';
					this.showFilters();
					BGGB.View.updateDisplay();
				} )
		);
	}

	/**
	 * Setup the action of changing the category filter.
	 *
	 * @since 1.7.0
	 */
	_onSelectChange() {
		this.$select.on( 'change', () => {
			this.setFilterVal();
			BGGB.Category.updateDisplay();
		} );
	}

	/**
	 * Get the users installed category.
	 *
	 * @since 1.7.0
	 *
	 * @return {string} inspiration catgegory.
	 */
	_setDefault() {
		const inspirationCategory = this._getInspirationsCategory(),
			defaultCategory =
				BoldgridEditor.block_default_industry || inspirationCategory || this.defaults.selection;

		// Make sure the selection exists in the dropdown.
		let preSelection;
		if ( this.$select.find( '[value="' + defaultCategory + '"]' ).length ) {
			preSelection = defaultCategory;
		} else if ( this.$select.find( '[value="' + this.defaults.selection + '"]' ).length ) {
			preSelection = this.defaults.selection;
		}

		if ( preSelection ) {

			// If the select value exists use it.
			this.$select.val( preSelection ).change();
		} else {

			// Otherwise preset the last item from the select box. (last item, not church).
			this.$select.find( 'option:last-of-type' ).prop( 'checked', true );
		}
	}

	/**
	 * Get the saved inspirations category.
	 *
	 * Not all categories are supported, if alias exists it needs to be specified.
	 *
	 * @since 1.7.0
	 *
	 * @return {string} Inspirations Category.
	 */
	_getInspirationsCategory() {
		let category;

		if ( BoldgridEditor.inspiration && BoldgridEditor.inspiration.subcategory_key ) {
			category = BoldgridEditor.inspiration.subcategory_key.toLowerCase();
			category = category.replace( ' ', '_' );
		}

		if ( 'property_management' === category ) {
			category = 'real_estate';
		}

		return category;
	}
}
