window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR,
		self = {

			/**
			 * Number of Gridblocks created.
			 *
			 * @since 1.5
			 *
			 * @type {Number}
			 */
			gridblockCount: 0,

			failure: false,

			licenseTypes: [],

			/**
			 * Get a set of Blocks.
			 *
			 * @since 1.5
			 *
			 * @return {$.deferred} Ajax response.
			 */
			fetch: function() {
				if ( self.fetching || self.failure ) {
					return false;
				}

				self.fetching = true;
				self.gridblockLoadingUI.start();

				return self
					.requestGridblocks()
					.done( function( gridblocks, text, xhr ) {
						self.licenseTypes = xhr.getResponseHeader( 'License-Types' ) || '[]';
						self.licenseTypes = JSON.parse( self.licenseTypes );

						BG.Service.connectKey.postLicenseCheck( self.licenseTypes );

						self.addToConfig( gridblocks );
						BG.GRIDBLOCK.View.createGridblocks();
					} )
					.always( function() {
						self.fetching = false;
						self.gridblockLoadingUI.finish();
					} )
					.fail( function() {
						self.failure = true;
						BG.GRIDBLOCK.View.$gridblockSection.append(
							wp.template( 'boldgrid-editor-gridblock-error' )()
						);
					} );
			},

			/**
			 * Does this user need to upgrade for this block?
			 *
			 * @since 1.7.0
			 *
			 * @param  {$} $gridblock Gridblock element.
			 * @return {boolean}      Is it required?
			 */
			needsUpgrade( $gridblock ) {
				return (
					( parseInt( $gridblock.attr( 'data-is-premium' ) ) &&
						parseInt( BG.GRIDBLOCK.View.$gridblocks.attr( 'data-requires-premium' ) ) ) ||
					( 'basic' === self.getLicense( $gridblock ) &&
						parseInt( BG.GRIDBLOCK.View.$gridblocks.attr( 'data-requires-basic' ) ) )
				);
			},

			getLicense( $gridblock ) {
				return $gridblock.attr( 'data-license' );
			},

			requestGridblocks: function( options ) {
				var type = BG.GRIDBLOCK.Category.getSearchType();
				options = options || {};

				return $.ajax( {
					type: 'post',
					url: ajaxurl,
					dataType: 'json',
					timeout: 60000,
					data: _.defaults( options, {
						action: 'boldgrid_generate_blocks',
						/*eslint-disable */
						boldgrid_editor_gridblock_save: BoldgridEditor.nonce_gridblock_save,
						quantity: 30,
						color_palettes: 1,
						version: BoldgridEditor.version,
						include_temporary_resources: 1,
						release_channel: BoldgridEditor.boldgrid_settings.theme_release_channel,
						key: BG.Service.connectKey.apiKey,
						transparent_backgrounds: 'post' === BoldgridEditor.post_type ? 1 : 0,
						type: type,
						color: JSON.stringify({ colors: BG.CONTROLS.Color.getGridblockColors() }),
						category: BG.GRIDBLOCK.View.industry.getSelected()
						/*eslint-enable */
					} )
				} );
			},

			/**
			 * Handle showing the loading graphic.
			 *
			 * @since 1.5
			 *
			 * @type {Object}
			 */
			gridblockLoadingUI: {
				start: function() {
					$( 'body' ).addClass( 'loading-remote-body' );
					BG.GRIDBLOCK.View.$gridblockNav.find( 'select' ).prop( 'disabled', true );
				},
				finish: function() {
					$( 'body' ).removeClass( 'loading-remote-body' );
					BG.GRIDBLOCK.View.$gridblockNav.find( 'select' ).prop( 'disabled', false );
				}
			},

			/**
			 * Add a set of Gridblocks to the configuration.
			 *
			 * @since 1.5
			 *
			 * @param {array} gridblocks Collection of Block configs.
			 */
			addToConfig: function( gridblocks ) {
				_.each( gridblocks, function( gridblockData, index ) {
					gridblocks[index] = self.addRequiredProperties( gridblockData );
					BG.GRIDBLOCK.Filter.addGridblockConfig(
						gridblocks[index],
						'generated-' + self.gridblockCount
					);

					self.gridblockCount++;
				} );
			},

			/**
			 * Set the background image for any remote gridblocks.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $html Gridblock jqury object.
			 */
			updateBackgroundImages: function( $html ) {
				var backgroundImageOverride = $html.attr( 'gb-background-image' );

				if ( backgroundImageOverride ) {
					$html.removeAttr( 'gb-background-image' ).css( 'background-image', backgroundImageOverride );
				}
			},

			/**
			 * Set properties of gridblock configurations.
			 *
			 * @since 1.5
			 *
			 * @param {object} gridblockData A Gridblock config.
			 */
			addRequiredProperties: function( gridblockData ) {
				var $html = $( gridblockData.html ),
					$previewHtml = $( gridblockData.preview_html );

				self.updateBackgroundImages( $html );
				self.updateBackgroundImages( $previewHtml );

				gridblockData.$previewHtml = $previewHtml;
				gridblockData['html-jquery'] = $html;

				return gridblockData;
			}
		};

	BG.GRIDBLOCK.Generate = self;
} )( jQuery );
