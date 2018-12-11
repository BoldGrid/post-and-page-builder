var $ = window.jQuery,
	BG = BOLDGRID.EDITOR,
	$window = $( window );

import LibraryInputTemplate from '../../../../includes/template/gridblock-library.html';

export class Save {
	constructor() {
		this.name = 'Library';

		this.panel = {
			title: 'Block Library',
			icon: 'gridblock-grid-icon',
			height: '430px',
			width: '600px',
			autoCenter: true,
			showOverlay: true
		};
	}

	/**
	 * Initialize this controls, usually runs right after the constructor.
	 *
	 * @since 1.6
	 */
	init() {
		BG.Controls.registerControl( this );
	}

	/**
	 * The DOM load method.
	 *
	 * @since 1.6
	 */
	setup() {
		this._bindHandlers();
	}

	/**
	 * Open the panel.
	 *
	 * @since 1.6
	 *
	 * @param  {Object} gridblockData GridBlock data.
	 */
	openPanel( gridblockData ) {
		BG.Panel.clear();
		this.gridblockData = gridblockData;
		this.$html = $( LibraryInputTemplate );
		this._setState( 'save-prompt' );

		if ( gridblockData.title ) {
			this.$html
				.find( 'input' )
				.val( gridblockData.title )
				.change();
		}

		BG.Panel.setContent( this.$html ).open( this );
		BG.Panel.centerPanel();
	}

	/**
	 * Save a GridBlock as a post.
	 *
	 * @since 1.6
	 *
	 * @param  {Object} data     Data to save.
	 * @return {$.deferred}      Ajax deffered object.
	 */
	ajax( data ) {
		data.action = 'boldgrid_editor_save_gridblock';
		data['boldgrid_editor_gridblock_save'] = BoldgridEditor.nonce_gridblock_save;

		return $.ajax( {
			url: ajaxurl,
			dataType: 'json',
			method: 'POST',
			timeout: 20000,
			data: data
		} );
	}

	/**
	 * Save the GridBlock Data.
	 *
	 * @since 1.6
	 *
	 * @param  {Object} data     GridBlock data.
	 * @return {$.Deferred}      Response.
	 */
	save( data ) {
		let $deferred = $.Deferred();

		if ( 'string' !== typeof data.html ) {
			data.html.always( html => {
				data.html = $( html ).html();

				this.ajax( data )
					.fail( response => {
						$deferred.reject( response );
					} )
					.done( response => {
						$deferred.resolve( response );
					} );
			} );

			return $deferred;
		} else {
			data.html = $( '<div>' + data.html + '</div>' ).html();
			return this.ajax( data );
		}
	}

	/**
	 * Add the newly created gridblock to the list of saved gridblocks.
	 *
	 * @since 1.6
	 */
	_addToConfig( post ) {

		/*
		 * If the user has not yet fetched saved blocks, don't add to the list because otherwise
		 * it will appear twice.
		 */
		if ( ! BG.GRIDBLOCK.View.fetchSaved || ! BG.GRIDBLOCK.View.fetchSaved.status ) {
			return;
		}

		let gridblockData = {
			html: post.post_content,
			post: post,
			dynamicImages: false,
			type: 'library',
			'html-jquery': $( post.post_content )
		};

		BG.GRIDBLOCK.Filter.addGridblockConfig( gridblockData, 'ui-saved-' + post.ID );
		BG.GRIDBLOCK.View.createGridblocks();
	}

	/**
	 * Set the current state.
	 *
	 * @since 1.6
	 *
	 * @param {string} state The state attr to be set.
	 */
	_setState( state ) {
		this.$html.attr( 'state', state );
	}

	/**
	 * Bind all event handlers.
	 *
	 * @since 1.6
	 */
	_bindHandlers() {
		this._setupFormSubmit();
	}

	/**
	 * Setup handiling of the form submission process.
	 *
	 * @since 1.6
	 */
	_setupFormSubmit() {
		BG.Panel.$element.on( 'submit', '.save-gridblock form', e => {
			let $form = $( e.target ),
				$button = $form.find( '.bg-editor-button' ),
				$input = $form.find( 'input' );

			e.preventDefault();

			BG.Panel.showLoading();
			$button.attr( 'disabled', 'disabled' );

			this.gridblockData.title = $input.val();

			this.save( this.gridblockData )
				.fail( () => {
					this._setState( 'save-failed' );
				} )
				.done( response => {
					this._setState( 'save-success' );
					this._addToConfig( response.data );
				} )
				.always( () => {
					BG.Panel.hideLoading();
					$button.removeAttr( 'disabled' );
				} );
		} );
	}
}

export { Save as default };
