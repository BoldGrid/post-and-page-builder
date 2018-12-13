window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

/**
 * Handles adding gridblocks.
 */
( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR,
		self = {
			$window: $( window ),

			/**
			 * Grab the markup for the selected Gridblock
			 *
			 * @since 1.4
			 *
			 * @param  {number} gridblockId Unique id for a gridblock.
			 * @return {string}             Html requested.
			 */
			getHtml: function( gridblockId ) {
				var html = '',
					gridblockData = {};

				if ( BG.GRIDBLOCK.configs.gridblocks[gridblockId] ) {
					gridblockData = BG.GRIDBLOCK.configs.gridblocks[gridblockId];
				}

				if ( self.getDynamicElements( gridblockData ).length ) {
					html = self.installImages( gridblockData );
					BG.GRIDBLOCK.Image.attributeImages( gridblockData );
				} else {
					html = self.getStaticHtml( gridblockData );
				}

				return html;
			},

			/**
			 * If the gridblock doesn't have any images to replace, just return the html.
			 *
			 * @since 1.4
			 *
			 * @param  {object} gridblockData Get the static html.
			 * @return {string}               Html of gridblock.
			 */
			getStaticHtml: function( gridblockData ) {
				var html = gridblockData.html;

				if ( gridblockData.$html ) {
					html = gridblockData.getHtml();
				}

				return html;
			},

			/**
			 * Get all elements that need images replaced.
			 *
			 * @since 1.5
			 *
			 * @param  {Object} gridblockData Single gridblock info.
			 * @return {jquery}               Collection of elements that need to have images replaced.
			 */
			getDynamicElements: function( gridblockData ) {
				var $dynamicElements = gridblockData.$html.find( '[dynamicimage]' );

				if (
					gridblockData.$html[0].hasAttribute( 'dynamicimage' ) &&
					'none' !== gridblockData.$html.css( 'background-image' )
				) {
					$dynamicElements.push( gridblockData.$html );
				}

				return $dynamicElements;
			},

			/**
			 * Get the markup for pages that need images replaced.
			 *
			 * @since 1.5
			 *
			 * @param  {object} gridblockData Gridblock info.
			 * @return {$.Deffered}           Deferred Object.
			 */
			installImages: function( gridblockData ) {
				var $deferred = $.Deferred(),
					completed = 0,
					$imageReplacements = self.getDynamicElements( gridblockData );

				$imageReplacements.each( function() {
					var $element = $( this );
					$element.removeAttr( 'dynamicimage' );

					$.ajax( {
						type: 'post',
						url: ajaxurl,
						dataType: 'json',
						timeout: 20000,
						data: {
							action: 'boldgrid_canvas_image',

							// eslint-disable-next-line
							boldgrid_gridblock_image_ajax_nonce: BoldgridEditor.grid_block_nonce,

							// eslint-disable-next-line
							image_data: BG.GRIDBLOCK.Image.getEncodedSrc($element)
						}
					} )
						.done( function( response ) {
							if ( response && response.success ) {
								BG.GRIDBLOCK.Image.addImageUrl( $element, response.data );
							}

							completed++;
							if ( completed === $imageReplacements.length ) {
								$deferred.resolve( gridblockData.getHtml() );
							}
						} )
						.fail( function() {
							completed++;
							if ( completed === $imageReplacements.length ) {
								$deferred.resolve( gridblockData.getHtml() );
							}
						} );
				} );

				return $deferred;
			}
		};

	BG.GRIDBLOCK.Create = self;
} )( jQuery );
