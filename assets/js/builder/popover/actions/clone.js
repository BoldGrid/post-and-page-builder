var BG = BOLDGRID.EDITOR;

export class Clone {
	constructor( popover ) {
		this.popover = popover;
	}

	/**
	 * Setup event listener.
	 *
	 * @since 1.6
	 */
	init() {
		this.popover.$element.find( '[data-action="duplicate"]' ).on( 'click', () => {
			this.clone();
			this.postClone();
		} );
	}

	/**
	 * Clone process.
	 *
	 * @since 1.6
	 */
	clone() {
		let $target = this.popover.getWrapTarget();

		$target.after( $target.clone() );
	}

	/**
	 * Process to occur after a clone.
	 *
	 * @since 1.6
	 */
	postClone() {
		BG.Controls.$container.trigger( 'boldgrid_clone_element', this.popover.getWrapTarget() );
		this.popover.updatePosition();
	}
}

export { Clone as default };
