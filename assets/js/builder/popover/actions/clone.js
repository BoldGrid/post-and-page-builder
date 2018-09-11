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
			let $clone = this.clone();
			this.postClone( $clone );
		} );
	}

	/**
	 * Clone process.
	 *
	 * @since 1.6
	 */
	clone() {
		let $target = this.popover.getWrapTarget(),
			$clone = $target.clone();

		$target.after( $clone );

		return $clone;
	}

	/**
	 * Process to occur after a clone.
	 *
	 * @since 1.6
	 */
	postClone( $clone ) {
		BG.Controls.$container.trigger( 'boldgrid_clone_element' );
		BG.Service.event.emit( 'clone' + this.popover.eventName, $clone );
		this.popover.updatePosition();
	}
}

export { Clone as default };
