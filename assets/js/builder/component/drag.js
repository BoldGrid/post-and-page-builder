var BG = BOLDGRID.EDITOR,
	$ = jQuery;

export class Drag {

	/**
	 * When the user drops a component onto their page fire component callbacks.
	 *
	 * @since 1.8.0
	 */
	bindBaseEvents() {
		this.bindDrop();
		this.bindEnter();
	}

	/**
	 * Bind the drag drop events.
	 *
	 * @since 1.8.0
	 */
	bindDrop() {

		// When the drop is made on the container, make the callbacks.
		BG.Controls.$container.on( 'drop', () => this._drop() );

		// When the drop is made on the window, trigger the drop on the container.
		$( window ).on( 'drop', () => {
			if ( BG.Service.popover.selection.component ) {

				// Don't chain the drop if the user never entered the container.
				if ( BG.Controls.$container.find( BG.Controls.$container.$temp_insertion ).length ) {
					BG.Controls.$container.trigger( 'drop' );
				} else {
					BG.Panel.$element.removeClass( 'component-drag' );
					BG.Controls.$container.drag_cleanup();
				}
			}
		} );
	}

	/**
	 * When the user enters the frame for the first time from the component panel
	 * prepend the component to the DOM.
	 *
	 * @since 1.8.0
	 */
	bindEnter() {
		BG.Controls.$container.$body.on( 'dragenter', () => {
			let $drag = BG.Controls.$container;
			if ( ! $drag.$current_drag ) {
				return;
			}

			if ( BG.Service.popover.selection.component && ! $drag.$current_drag.IMHWPB.componentEntered ) {
				BG.Panel.closePanel();
				$drag.$current_drag.IMHWPB.componentEntered = true;
				BG.Service.component.prependContent( BG.Controls.$container.$temp_insertion );
			}
		} );
	}

	/**
	 * Bind the drag start event per component.
	 *
	 * Chain the start event to trigger a start event in the iframe DOM.
	 *
	 * @since 1.8.0
	 */
	bindStart( component ) {
		let $context = BG.Panel.$element.find( '.bg-component' );

		$context.find( `[data-name="${component.name}"]` ).on( 'dragstart', event => {
			let $dragElement = component.getDragElement();
			event.skipDragImage = true;
			BG.Panel.$element.addClass( 'component-drag' );

			BG.Service.component.validateEditor();
			BG.Controls.$container.validate_markup();

			BG.Service.popover.selection = {
				name: 'content',
				component: component,
				$target: $dragElement,
				getWrapTarget: () => $dragElement
			};

			BG.Controls.$container.drag_handlers.start( event );
		} );
	}

	/**
	 * Fire the drop callbacks.
	 *
	 * @since 1.8.0
	 */
	_drop() {
		let component = BG.Service.popover.selection.component;
		if ( component ) {
			BG.Panel.$element.removeClass( 'component-drag' );
			BG.Panel.closePanel();
			component.onDragDrop( component, BG.Controls.$container.$temp_insertion );
			BG.Service.popover.selection.component = null;
		}
	}
}
