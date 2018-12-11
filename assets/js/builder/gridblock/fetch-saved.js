window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

const BGGB = BOLDGRID.EDITOR.GRIDBLOCK;

export class FetchSaved {
	constructor() {
		this.status = '';
	}

	/**
	 * API call for all saved & library blocks.
	 *
	 * @since 1.7.0
	 */
	fetch() {

		// Fetch currently grabs all blocks in 1 run, dont run twice.
		if ( this.status ) {
			return false;
		}

		this.status = 'fetching';
		BGGB.Generate.gridblockLoadingUI.start();

		return this._call()
			.done( gridblocks => {
				this.status = 'done';
				BGGB.Filter.savedBlocksConfigs( gridblocks );
				BGGB.View.createGridblocks();
				this.setGridblockCount();
			} )
			.always( () => {
				this.status = 'fetching';
				BGGB.Generate.gridblockLoadingUI.finish();
			} )
			.fail( () => {
				this.status = 'failed';
				BGGB.View.$gridblockSection.find( '.gridblocks' ).attr( 'error', 'saved' );
			} );
	}

	/**
	 * Set Gridblock count.
	 *
	 * @since 1.5
	 */
	setGridblockCount() {
		let types = _.countBy( BGGB.configs.gridblocks || [], 'type' );

		BGGB.View.$gridblockSection
			.find( '.gridblocks' )
			.attr( 'my-gridblocks-count', ( types.saved || 0 ).toString() )
			.attr( 'library-gridblocks-count', ( types.library || 0 ).toString() );
	}

	/**
	 * Make the API call to get saved blocks.
	 *
	 * @since 1.7.0
	 *
	 * @return {$.deferred} Deferred API call.
	 */
	_call() {
		return $.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 20000,
			data: {
				/*eslint-disable */
				action: 'boldgrid_get_saved_blocks',
				post_id: BoldgridEditor.post_id,
				boldgrid_editor_gridblock_save: BoldgridEditor.nonce_gridblock_save
				/*eslint-enable */
			}
		} );
	}
}
