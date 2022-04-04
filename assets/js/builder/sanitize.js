let $ = jQuery,
	BG = BOLDGRID.EDITOR;

export class Sanitize {
	constructor() {
		this.classes = {
			component: [ 'bg-control-element' ],
			resize: [
				'resizing-imhwpb',
				'resize-border-left-imhwpb',
				'resizing-imhwpb',
				'popover-hover',
				'resize-border-right-imhwpb',
				'content-border-imhwpb'
			]
		};

		this._classConfig = this._setupClassConfig();
	}

	/**
	 * Remove any markup that was added for editting.
	 *
	 * @since 1.8.0
	 */
	cleanup( markup ) {
		var $markup = $( '<div>' + markup + '</div>' );
		this.removeClasses( $markup );
		this.cleanupButtons( $markup );

		BG.Service.event.emit( 'cleanup', $markup );

		return $markup.html();
	}

	/**
	 * Cleanup Buttons.
	 *
	 * Remove duplicated button classes.
	 *
	 * @param {*} $context
	 */
	cleanupButtons( $context ) {
		var buttons = {
				primary: $context.find( '.button-primary' ),
				secondary: $context.find( '.button-secondary' )
			},
			buttonClasses = BoldgridEditor.builder_config.theme_buttons;

		buttons.primary.each( function() {
			var $button = $( this );
			$button.attr( 'class', buttonClasses.primary );
		} );

		buttons.secondary.each( function() {
			var $button = $( this );
			$button.attr( 'class', buttonClasses.secondary );
		} );
	}

	/**
	 * Remove classes by type.
	 *
	 * All classes removed by default.
	 *
	 * @since 1.8.0
	 *
	 * @param  {$} $context   Context to search in.
	 * @param  {string} type  Type of classes to remove.
	 */
	removeClasses( $context, type ) {
		let types = type ? [ type ] : Object.keys( this.classes );
		for ( let type of types ) {
			$context.find( this._classConfig[type].selector ).removeClass( this._classConfig[type].classes );
		}
	}

	/**
	 * Class configuration.
	 *
	 * @since 1.8.0
	 *
	 * @return {object} Confguration of classes values.
	 */
	_setupClassConfig() {
		let classConfig = {};
		for ( let type in this.classes ) {
			classConfig[type] = {
				classes: this.classes[type].join( ' ' ),
				selector: this.classes[type].map( className => '.' + className ).join()
			};
		}

		return classConfig;
	}
}
