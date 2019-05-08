window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};

( function( $ ) {
	'use strict';

	var self,
		BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.Panel = {
		$element: null,

		currentControl: null,

		/**
		 * Initialize the panel.
		 *
		 * @since 1.3
		 *
		 * @return jQuery $this.$element Panel Element
		 */
		init: function() {
			this.$body = $( 'body' );

			this.create();
			this._setupPanelClose();
			this._setupDrag();

			//This._setupPanelResize();
			this._setupCustomizeLeave();
			this._setupCustomizeDefault();
			this._lockPanelScroll();
			this._setupAutoCenter();
			this._setupEscapeClose();

			return this.$element;
		},

		/**
		 * Create Panel HTML.
		 *
		 * @since 1.3
		 */
		create: function() {
			this.$element = $( wp.template( 'boldgrid-editor-panel' )() );
			this.$loading = this.$element.find( '.bg-loading-spinner' );
			this.$body.append( this.$element );
		},

		/**
		 * Set the html for the panel body of the panel.
		 *
		 * @since 1.3
		 */
		setContent: function( content ) {
			this.$element.find( '.panel-body' ).html( content );

			return this;
		},

		/**
		 * Set title of the panel.
		 *
		 * @since 1.3
		 */
		setTitle: function( title ) {
			this.$element.find( '.panel-title .name' ).html( title );
		},

		/**
		 * Set info.
		 *
		 * @since 1.6
		 */
		setInfo: function( title ) {
			this.$element.find( '.panel-title .info' ).html( title );
		},

		/**
		 * Show a loading graphix in the panel.
		 *
		 * @since 1.6
		 */
		showLoading: function() {
			this.$element.find( '.panel-body' ).addClass( 'block-access-overlay' );
			this.$loading.addClass( 'enabled' );
		},

		/**
		 * Hide the loading graphic in the panel.
		 *
		 * @since 1.6
		 */
		hideLoading: function() {
			this.$element.find( '.panel-body' ).removeClass( 'block-access-overlay' );
			this.$loading.removeClass( 'enabled' );
		},

		/**
		 * Reset Panel Position
		 *
		 * @since 1.3
		 */
		resetPosition: function() {
			this.$element.css( {
				top: '',
				right: '',
				bottom: '',
				left: ''
			} );
		},

		/**
		 * Set the dimensions of the panel.
		 *
		 * @since 1.3
		 */
		setDimensions: function( width, height ) {
			this.$element.width( width );
			this.$element.height( height );
		},

		/**
		 * Center the panel.
		 *
		 * @since 1.2.7
		 */
		centerPanel: function() {
			var $window = $( window ),
				width = parseInt( this.$element.css( 'width' ) ),
				height = parseInt( this.$element.css( 'height' ) ),
				windowWidth = $window.width(),
				windowHeight = $window.height(),
				centerWidth = windowWidth / 2 - width / 2,
				centerHeight = windowHeight / 2 - height / 2;

			this.$element.css( {
				top: centerHeight,
				left: centerWidth
			} );
		},

		/**
		 * Setup Scrolling within the panel.
		 *
		 * @param control BG.Control.
		 * @since 1.3
		 */
		initScroll: function() {
			self.createScrollbar( self.getScrollTarget(), this.currentControl.panel || {} );
		},

		/**
		 * Remove any existing scroll bar and add another to specified panel config.
		 *
		 * @since 1.5.1
		 *
		 * @param  {string} selector
		 * @param  {object} config   Configuration.
		 */
		createScrollbar: function( selector, config ) {

			// Default height of scroll is the height of body minus this number.
			var sizeOffset = -66,
				$target = this.$element.find( selector );

			if ( config && config.sizeOffset ) {
				sizeOffset = config.sizeOffset;
			}

			// Remove existing scroll.
			self.$element
				.find( '.slimScrollDiv >:first-child' )
				.slimScroll( { destroy: true } )
				.attr( 'style', '' );

			$target.slimScroll( {
				color: '#32373c',
				size: '8px',
				height: parseInt( config.height ) + sizeOffset,
				alwaysVisible: true,
				disableFadeOut: true,
				wheelStep: 5
			} );
		},

		/**
		 * Check if a control is currently open.
		 *
		 * @since 1.3
		 * @param control BG.Control.
		 * @return bool isOpenControl.
		 */
		isOpenControl: function( control ) {
			var isOpenControl = false;

			if ( this.$element.is( ':visible' ) && this.$element.attr( 'data-type' ) === control.name ) {
				isOpenControl = true;
			}

			return isOpenControl;
		},

		/**
		 * When the user presses escpae, close the panel.
		 *
		 * @since 1.6
		 */
		_setupEscapeClose() {
			let callback = e => {
				if (
					27 === e.keyCode &&
					this.currentControl &&
					this.currentControl.panel &&
					! this.currentControl.panel.disabledClose &&
					this.$element.is( ':visible' )
				) {
					self.closePanel();
				}
			};

			BG.$window.on( 'keyup', callback );
			BG.Controls.$container.on( 'keyup', callback );
		},

		/**
		 * Initialize dragging of the panel.
		 *
		 * @since 1.3
		 */
		_setupDrag: function() {
			this.$element.draggable( {
				containment: '#wpwrap',
				handle: '.panel-title',
				scroll: false
			} );
		},

		/**
		 * Remove all selected options.
		 *
		 * @since 1.3
		 */
		clearSelected: function() {
			this.$element.find( '.selected' ).removeClass( 'selected' );
		},

		/**
		 * Setup resizing of the panel.
		 *
		 * @since 1.3
		 */
		_setupPanelResize: function() {
			this.$element.resizable();
		},

		/**
		 * Setup resizing of the panel.
		 *
		 * @since 1.3
		 */
		_setupPanelClose: function() {
			this.$element.on( 'click', '.close-icon, button.dismiss', function() {
				self.closePanel();
			} );
		},

		/**
		 * Strip temp classes.
		 *
		 * @since 1.3
		 */
		removeClasses: function() {
			BG.Controls.$container.find( '.bg-control-element' ).removeClass( 'bg-control-element' );
		},

		/**
		 * Close panel.
		 *
		 * @since 1.3
		 */
		closePanel: function() {
			self.$element.hide();
			BG.Panel.hideLoading();
			BOLDGRID.EDITOR.Menu.deactivateControl();
			self.removeClasses();

			if ( self.$element.hasClass( 'customize-open' ) ) {
				this.$element.trigger( 'bg-customize-exit' );
				self.$element.removeClass( 'customize-open' );
			}

			this.$element.find( '.panel-body' ).empty();

			this.$element.removeClass( 'drag-disabled' );
			this.$element.trigger( 'bg-panel-close' );
			this.$body.removeClass( 'bg-editor-overlay' );
			BOLDGRID.EDITOR.mce.undoManager.add();
		},

		/**
		 * Scroll to the element that has the selected class.
		 *
		 * @since 1.3
		 */
		scrollToSelected: function() {
			var scrollPos,
				scrollOffset,
				$selected = self.$element.find( '.selected:not(.filters .selected):visible' );

			self.scrollTo( 0 );

			if ( ! $selected.length ) {
				return;
			}

			scrollOffset = 0;
			if ( self.currentControl.panel.scrollOffset ) {
				scrollOffset = self.currentControl.panel.scrollOffset;
			}

			scrollPos = $selected.position().top + scrollOffset;
			self.scrollTo( scrollPos + 'px' );
		},

		/**
		 * Get the controls scrollable target.
		 *
		 * @since 1.3
		 * @return string target.
		 */
		getScrollTarget: function() {
			var target = '.panel-body';
			if ( self.currentControl && self.currentControl.panel.scrollTarget ) {
				target = self.currentControl.panel.scrollTarget;
			}

			return target;
		},

		/**
		 * Scroll to a pixel position.
		 *
		 * @since 1.3
		 * @param integer to Position to scroll to.
		 * @return string target.
		 */
		scrollTo: function( to ) {
			this.$element.find( self.getScrollTarget() ).slimScroll( {
				scrollTo: to,
				alwaysVisible: true,
				disableFadeOut: true
			} );
		},

		/**
		 * Delete all content from a panel.
		 *
		 * @since 1.3
		 */
		clear: function() {
			this.$element.find( '.panel-title .name' ).empty();
			this.$element.find( '.panel-title .info' ).empty();
			this.$element.find( '.panel-body' ).empty();
			this.$element.find( '.panel-title .icon' ).attr( 'class', '' );
			this.hideLoading();
		},

		/**
		 * Show the footer of a panel if the control configures it.
		 *
		 * @since 1.3
		 */
		_enableFooter: function( config ) {
			if ( config && config.includeFooter ) {
				self.showFooter();
			} else {
				self.hideFooter();
			}
		},

		/**
		 * Hide footer.
		 *
		 * @since 1.3
		 */
		hideFooter: function() {
			this.$element.find( '.panel-footer' ).hide();
		},

		/**
		 * Show footer.
		 *
		 * @since 1.3
		 */
		showFooter: function() {
			this.$element.find( '.panel-footer' ).show();
		},

		/**
		 * Setup handlers for the user clicking on the customize button.
		 *
		 * @since 1.3
		 */
		_setupCustomize: function( control ) {
			if ( ! control.panel.customizeCallback ) {
				return;
			}

			self.$element.find( '.panel-footer .customize .panel-button' ).on( 'click', function( e ) {
				e.preventDefault();
				self.customizeOpenEvent();
				if (
					self.$element.attr( 'data-type' ) === control.name &&
					true !== self.currentControl.panel.customizeCallback
				) {
					control.panel.customizeCallback();
				}
			} );
		},

		customizeOpenEvent() {
			self.$element.trigger( 'bg-customize-open' );
			self.$element.addClass( 'customize-open' );
		},

		isCustomizeOpen() {
			return self.$element.hasClass( 'customize-open' );
		},

		enterCustomization() {
			self.$element.find( '.panel-body .customize' ).show();
			self.$element.find( '.presets' ).hide();
			self.$element.find( '.title' ).hide();
			self.scrollTo( 0 );
			self.hideFooter();
			BG.Service.customize.navigation.enable();
		},

		/**
		 * Bind the default behavior that occurs when the user clicks the customize button.
		 *
		 * @since 1.3
		 */
		_setupCustomizeDefault: function() {
			self.$element.find( '.panel-footer .customize .panel-button' ).on( 'click', function( e ) {
				e.preventDefault();

				if (
					self.currentControl &&
					self.currentControl.panel &&
					true === self.currentControl.panel.customizeCallback
				) {
					self.enterCustomization();
				}
			} );
		},

		/**
		 * Hide a panels customization area upon clicking the back button.
		 *
		 * @since 1.3
		 */
		_setupCustomizeLeave: function() {
			self.$element.on( 'click', '.back .panel-button', function( e ) {
				e.preventDefault();
				self.$element.removeClass( 'customize-open' );

				if (
					self.currentControl &&
					self.currentControl.panel &&
					true === self.currentControl.panel.customizeLeaveCallback
				) {
					self.$element.find( '.presets' ).show();
					self.$element.find( '.title' ).show();
					self.$element.find( '.panel-body .customize' ).hide();
					BG.Service.customize.navigation.disable();
					self.toggleFooter();
					self.scrollToSelected();
					self.$element.trigger( 'bg-customize-exit' );
				}
			} );
		},

		/**
		 * Generic control for applying classes to an component.
		 *
		 * @since 1.6
		 *
		 * @param  {object} control Control Class.
		 */
		setupPanelClick: function( control ) {
			var panel = BOLDGRID.EDITOR.Panel;

			if ( ! control.panel || ! control.panel.styleCallback ) {
				return;
			}

			panel.$element.on(
				'click',
				'[data-control-name="' + control.name + '"] .panel-selection',
				function() {
					var $target = BG.Menu.getCurrentTarget(),
						$this = $( this );

					BG.Util.removeComponentClasses( $target, control.componentPrefix );

					$target.addClass( $this.attr( 'data-preset' ) );
					panel.$element.find( '.selected' ).removeClass( 'selected' );
					$this.addClass( 'selected' );
				}
			);
		},

		/**
		 * Show the panel footer if something is selected.
		 *
		 * @since 1.3
		 */
		toggleFooter: function() {
			if ( self.$element.find( '.panel-body .selected' ).length ) {
				self.showFooter();
			} else {
				self.hideFooter();
			}
		},

		/**
		 * Unselect the current area.
		 *
		 * @since 1.3
		 */
		collapseSelection: function() {
			if ( 'icon' !== self.currentControl.name ) {
				BOLDGRID.EDITOR.mce.selection.collapse( false );
				BOLDGRID.EDITOR.mce.nodeChanged();
			}
		},

		/**
		 * Setup scroll locking.
		 *
		 * @since 1.3
		 */
		_lockPanelScroll: function() {
			if ( window.addEventListener ) {
				this.$element[0].addEventListener( 'DOMMouseScroll', self._onWheel, false );
				this.$element[0].addEventListener( 'mousewheel', self._onWheel, false );
			}
		},

		/**
		 * Lock The scroll.
		 *
		 * @since 1.3
		 */
		_onWheel: function( e ) {
			e = e || window.event;

			if ( e.preventDefault ) {
				e.preventDefault();
			}

			e.returnValue = false;
		},

		preselect: function() {
			var $target, classes;

			if ( ! this.currentControl.panel.preselectCallback ) {
				return;
			}

			$target = BG.Menu.getCurrentTarget();
			classes = BG.Util.getClassesLike( $target, this.currentControl.componentPrefix );

			classes = classes.join( ' ' );
			this.clearSelected();
			this.$element.find( '[data-preset="' + classes + '"]:first' ).addClass( 'selected' );
		},

		/**
		 * Show overlay while this panel is displayed.
		 *
		 * @since 1.6
		 */
		showOverlay() {
			if ( this.currentControl.panel && this.currentControl.panel.showOverlay ) {
				this.$body.addClass( 'bg-editor-overlay' );
				this.$element.addClass( 'drag-disabled' );
			}
		},

		/**
		 * Handle auto recentering panels on window resize.
		 *
		 * @since 1.6
		 */
		_setupAutoCenter() {
			let debounceCallback = _.debounce( () => {
				if ( this.currentControl && this.currentControl.panel.autoCenter ) {
					this.centerPanel();
				}
			}, 500 );

			$( window ).on( 'resize', debounceCallback );
		},

		/**
		 * Set the icon displayed based on the current control.
		 *
		 * @since 1.6
		 */
		_setIcon() {
			if ( this.currentControl.panel && this.currentControl.panel.icon ) {
				this.$element
					.find( '.panel-title [data-id="icon"]' )
					.attr( 'class', this.currentControl.panel.icon )
					.addClass( 'icon' );
			}
		},

		/**
		 * Open the panel for a control.
		 *
		 * @since 1.3
		 */
		open: function( control ) {
			var $target;

			BOLDGRID.EDITOR.mce.undoManager.add();

			BOLDGRID.EDITOR.Menu.activateControl( control );

			this.currentControl = control;
			this.$element.addClass( 'ui-widget-content' );
			this.setDimensions( control.panel.width, control.panel.height );
			this.setTitle( control.panel.title );
			this.$element.attr( 'data-type', control.name );
			this.$element.find( '.panel-body' ).attr( 'data-control-name', control.name );
			this._enableFooter( control.panel );
			this._setupCustomize( control );
			BG.Tooltip.renderTooltips();
			this.$element.show();
			this.initScroll( control );
			this.preselect();

			this.scrollToSelected();
			this.collapseSelection();
			this.showOverlay();
			this._setIcon();
			BOLDGRID.EDITOR.CONTROLS.Generic.initControls();
			self.removeClasses();
			$target = BG.Menu.getCurrentTarget() || $();
			$target.addClass( 'bg-control-element' );

			BG.CONTROLS.Color.initColorControls();

			this.$element.trigger( 'open' );
		}
	};

	self = BOLDGRID.EDITOR.Panel;
} )( jQuery );
