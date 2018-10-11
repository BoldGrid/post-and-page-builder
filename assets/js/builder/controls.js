window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};

( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR;

	BOLDGRID.EDITOR.Controls = {

		/**
		 * @var jQuery $panel Panel DOM Element.
		 *
		 * @since 1.2.7
		 */
		$panel: null,

		/**
		 * @var jQuery $menu Menu DOM Element.
		 *
		 * @since 1.2.7
		 */
		$menu: null,

		/**
		 * @var jQuery $colorControl Color Panel Element.
		 *
		 * @since 1.2.7
		 */
		$colorControl: null,

		/**
		 * @var array controls All registered controls.
		 *
		 * @since 1.2.7
		 */
		controls: [],

		/**
		 * @var array controls All registered controls.
		 *
		 * @since 1.2.7
		 */
		indexedControls: {},

		/**
		 * @var jQuery $container tinymce iFrame Element.
		 *
		 * @since 1.2.7
		 */
		$container: null,

		/**
		 * Initialize all controls for the builder.
		 * This is the primary file and function for the builder directory.
		 *
		 * @since 1.2.7
		 */
		init: function( $container ) {
			this.$container = $container;

			this.$container.find( 'body' ).css( 'marginTop', '50px' );

			// Init Menu.
			this.$menu = BOLDGRID.EDITOR.Menu.init();

			// Init Panel.
			this.$panel = BOLDGRID.EDITOR.Panel.init();

			this.onEditibleClick();

			this.setupSliders();

			BG.$window.trigger( 'boldgrid_editor_preload' );

			// Create all controls.
			this.setupControls();

			BG.CONTROLS.Generic.setupInputCustomization();
			BG.CONTROLS.Generic.setupInputInitialization();
			BG.NOTICE.Update.init();

			this.browser = BG.Util.checkBrowser();

			BG.$window.trigger( 'boldgrid_editor_loaded' );
		},

		/**
		 * Check if the theme has the passed feature.
		 *
		 * @since 1.2.7
		 * @param string feature.
		 * @return bool.
		 */
		hasThemeFeature: function( feature ) {
			return -1 !== BoldgridEditor.builder_config.theme_features.indexOf( feature );
		},

		/**
		 * Add inline style to a element in the tinymce DOM. Needs to wrap dom.Style to work in tinymce.
		 *
		 * @since 1.2.7
		 *
		 * @param jQuery element.
		 * @param string property.
		 * @param string value.
		 */
		addStyle: function( element, property, value ) {

			// element.css( property, value );
			BOLDGRID.EDITOR.mce.dom.setStyle( element, property, value );
		},

		/**
		 * Add inline style to a element in the tinymce DOM. Needs to wrap dom.Style to work in tinymce.
		 *
		 * @since 1.8.0
		 *
		 * @param jQuery element.
		 * @param object values.
		 */
		addStyles: function( element, values ) {

			// element.css( values );
			BOLDGRID.EDITOR.mce.dom.setStyles( element, values );
		},

		/**
		 * Setup general slide behavior within the panel. Update the displayed value when sliding.
		 *
		 * @since 1.2.7
		 *
		 * @param event.
		 * @param ui.
		 */
		setupSliders: function() {
			this.$panel.on( 'slide', '.section .slider', function( event, ui ) {
				var $this = $( this );
				$this.siblings( '.value' ).html( ui.value );
			} );
		},

		/**
		 * Add a control to the list of controls to be created.
		 *
		 * @since 1.2.7
		 */
		registerControl: function( control ) {
			this.controls.push( control );
			this.indexedControls[control.name] = control;
		},

		/**
		 * Get a control instance by name.
		 *
		 * @since 1.6
		 *
		 * @param  {string} name Control name.
		 * @return {object}      Control instance.
		 */
		get: function( name ) {
			return this.indexedControls[name] || this.indexedControls[name.toLowerCase()];
		},

		/**
		 * Get the tinymce editor instance.
		 *
		 * @since 1.2.7
		 * @return IMHWPB.WP_MCE_Draggable.
		 */
		editorMceInstance: function() {
			var instance = false;

			if ( IMHWPB.WP_MCE_Draggable && IMHWPB.WP_MCE_Draggable.instance ) {
				instance = IMHWPB.WP_MCE_Draggable.instance;
			}

			return instance;
		},

		/**
		 * Clear menu items storage array.
		 *
		 * @since 1.2.7
		 */
		clearMenuItems: function() {
			this.$menu.items = [];
		},

		/**
		 * Bind event for updating Drop Tab.
		 *
		 * @since 1.2.7
		 */
		_setupUpdateMenu: function() {
			var self = this;

			this.$container.on( 'click', function( e ) {
				self.$menu.find( 'li[data-action]' ).hide();

				if ( ! self.$menu.items.length ) {
					self.$menu.hide();
					BOLDGRID.EDITOR.Panel.closePanel();
				} else {
					self.$menu.show();
				}

				$.each( self.$menu.items, function() {
					self.$menu.find( '[data-action="menu-' + this + '"]' ).show();

					//If a panel is open.
					BOLDGRID.EDITOR.Menu.reactivateMenu();
				} );

				self._closeOpenControl();

				if ( ! e.boldgridRefreshPanel ) {
					BOLDGRID.EDITOR.CONTROLS.Color.closePicker();
				}

				self.clearMenuItems();
			} );
		},

		/**
		 * Bind event for clicking on the iFrame body.
		 *
		 * @since 1.2.7
		 */
		onEditibleClick: function() {
			this._setupUpdateMenu();
		},

		/**
		 * If a control is open and the corresponding menu item is not present.
		 *
		 * @since 1.2.7
		 */
		_closeOpenControl: function() {
			if (
				BG.Panel.currentControl &&
				-1 === this.$menu.items.indexOf( BG.Panel.currentControl.name )
			) {
				BG.Panel.closePanel();
			}
		},

		/**
		 * Setup Controls.
		 *
		 * @since 1.2.7
		 */
		setupControls: function() {
			var self = this;

			this.controls = _.sortBy( this.controls, 'priority' );

			// Bind each menu control.
			$.each( this.controls, function() {
				self.setupControl( this );
			} );

			// Trigger a click on the body to display global controls.
			if ( ! BoldgridEditor.display_intro ) {
				this.$container.find( 'body' ).click();
			}
		},

		/**
		 * Setup a single control.
		 *
		 * @since 1.2.7
		 */
		setupControl: function( control ) {
			this.bindControlHandler( control );
			BOLDGRID.EDITOR.Menu.createListItem( control );

			if ( control.setup ) {
				control.setup();
			}

			BG.Panel.setupPanelClick( control );
		},

		/**
		 * Bind Event: Clicking on an elements selectors.
		 *
		 * @since 1.2.7
		 */
		bindControlHandler: function( control ) {
			if ( control.selectors ) {
				this.setupElementClick( control );
			}

			// When the user clicks on a menu item, perform the corresponding action.
			if ( control.onMenuClick ) {
				this.$menu.on( 'click', '[data-action="menu-' + control.name + '"]', () =>
					control.onMenuClick()
				);
			}
		},

		setupElementClick: function( control ) {
			var self = this;

			// When the user clicks on an element that has an associated control.
			// Add that control to the list of controls to be made visible.
			control.selectorString = control.selectors.join();
			this.$container.on( 'click', control.selectors.join(), function( e ) {
				var $this = $( this ),
					controlEventNamespace = 'bg-' + control.name;

				//@TODO: Move this.
				if ( 'box' === control.name ) {
					let isEditingNested, isNestedColumn;

					if ( e.boxFound ) {
						return;
					}

					isEditingNested = $this.closest( '.editing-as-row' ).length;
					isNestedColumn = $this.is( '.row .row [class*="col-md"]' );

					if ( isEditingNested && false === isNestedColumn ) {
						return;
					}

					if ( isEditingNested ) {
						e.boxFound = true;
					}

					if ( ! e.boxFound && $this.parent().closest( '[class*="col-md"]' ).length ) {
						let $module = BOLDGRID.EDITOR.CONTROLS.Box.findModule( $this ),
							backgroundColor = $module.css( 'background-color' );

						if ( ! BOLDGRID.EDITOR.CONTROLS.Color.isColorTransparent( backgroundColor ) ) {
							e.boxFound = true;
						} else {
							return;
						}
					}
				}

				if ( $this.closest( '[contenteditable="false"]:not(.wpview)' ).length ) {
					return;
				}

				if ( $this.closest( '.wpview' ).length && 'edit-media' !== control.name ) {
					return;
				}

				// If the user clicks one of the controls exceptions, skip.
				if ( control.exceptionSelector && e.target && $( e.target ).is( control.exceptionSelector ) ) {
					return;
				}

				if ( control.allowNested ) {
					e[controlEventNamespace] = e[controlEventNamespace] || {};
					if ( e[controlEventNamespace].found ) {
						return;
					}

					e[controlEventNamespace].found = true;
				}

				self.$menu.targetData = self.$menu.targetData || {};
				self.$menu.targetData[control.name] = $this;

				if ( control.elementClick ) {
					control.elementClick( e );
				}

				self.$menu.items.push( control.name );
			} );
		}
	};
} )( jQuery );
