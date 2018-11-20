var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import './base.scss';

export class Base {

	/**
	 * Bind the event of dismiss to the OKay button.
	 *
	 * @since 1.3
	 */
	bindDismissButton() {
		BG.Panel.$element
			.find( '.bg-upgrade-notice, .setup, .base-notice' )
			.find( '.dismiss' )
			.one( 'click', () => {
				this.dismissPanel();
			} );
	}

	/**
	 * Remove the effects added to the notification.
	 *
	 * @since 1.3
	 */
	removeEffects() {
		$( 'body' ).removeClass( 'bg-editor-intro-1-3 fadeout-background bg-editor-intro' );
		BG.Panel.resetPosition();
		BG.Panel.closePanel();
		BG.Panel.$element.removeClass( 'animated bounceOutDown bounceInDown' );
	}

	/**
	 * Hide the panel.
	 *
	 * @since 1.3
	 */
	dismissPanel() {
		let $body = $( 'body' );

		$body.addClass( 'fadeout-background' );
		BG.Panel.$element
			.addClass( 'bounceOutDown' )
			.one( 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', () => {
				this.removeEffects();
			} );

		setTimeout( () => {
			this.removeEffects();
		}, 1000 );
	}
}

export { Base as default };
