var BG = BOLDGRID.EDITOR;

export class Delete {
	constructor( popover ) {
		this.popover = popover;
	}

	/**
	 * Setup event listeners.
	 *
	 * @since 1.6
	 */
	init() {
		this.popover.$element.find( '[data-action="delete"]' ).on( 'click', event => {
			event.preventDefault();
			this.delete();
		} );
	}

	/**
	 * Delete process.
	 *
	 * @since 1.6
	 */
	delete() {
		var $target = this.popover.getWrapTarget();
		if ( $target.is( 'td, th' ) ) {
			$target = $target.closest( 'table' );
		}
		$target.remove();
		this.popover.$element.hide();
		this.popover.updatePosition();
		BG.Controls.$container.trigger( 'delete_dwpb' );
	}
}

export { Delete as default };
