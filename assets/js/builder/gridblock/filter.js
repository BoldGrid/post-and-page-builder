window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

( function( $ ) {
	'use strict';

	var BG = BOLDGRID.EDITOR,
		self = {
			configs: BoldgridEditor.gridblocks,

			removedGridlocks: {},

			/**
			 * Setup the Block configuration.
			 *
			 * @since 1.4
			 */
			setupConfigs: function() {
				BG.GRIDBLOCK.configs = {};
				BG.GRIDBLOCK.configs.gridblocks = {};
				self.loadingTemplate = wp.template( 'boldgrid-editor-gridblock-loading' );
			},

			/**
			 * Add the block configs from the saved API call.
			 *
			 * @since 1.7.0
			 *
			 * @param  {array} configs List of blocks.
			 */
			savedBlocksConfigs( configs ) {
				self.configs = configs;

				$.each( self.configs, function( gridblockId ) {
					this.html = self.unsetImageUrls( this.html );
					this.$previewHtml = $( self.unsetImageUrls( this.preview_html ) );
					this.$html = $( this.html );

					if ( 'library' !== this.type ) {
						self.removeInvalidGridblocks( this, gridblockId );
					} else if ( 'publish' !== this.status ) {
						self.removeGridblock( gridblockId );
					}
				} );

				self.setConfig();
			},

			/**
			 * Removing image src urls.
			 *
			 * @since 1.5
			 *
			 * @param  {string} html HTML to update.
			 * @return {string}      Return html string.
			 */
			unsetImageUrls: function( html ) {
				var matches = html.match( /<img.*?>/g );
				matches = matches || [];

				_.each( matches, function( match ) {
					html = html.replace( match, match.replace( /\ssrc=/, ' data-src=' ) );
				} );

				return html;
			},

			/**
			 * Schedule any invalid gridblocks for removal.
			 *
			 * @since 1.4
			 *
			 * @param  {Object} gridblock   Config for Gridblock.
			 * @param  {integer} gridblockId Index of Gridblock
			 */
			removeInvalidGridblocks: function( gridblock, gridblockId ) {
				var isSimpleGridblock = self.isSimpleGridblock( gridblock.$html );

				if ( isSimpleGridblock ) {
					self.removeGridblock( gridblockId );
				}
			},

			/**
			 * Config Methods.
			 *
			 * These are merged into the config object.
			 *
			 * @type {Object}
			 */
			configMethods: {

				/**
				 * Get the jQuery HTML Object.
				 * @return {jQuery} HTML to be added to the page.
				 */
				getHtml: function( key ) {
					let html = '';
					key = key && 'preview' === key ? '$previewHtml' : '$html';

					this[key].each( function() {
						if ( this.outerHTML ) {
							html += this.outerHTML;
						}
					} );

					return '<div class="temp-gridblock-wrapper">' + html + '</div>';
				},

				/**
				 * Create a placeholder based on the preview object.
				 *
				 * @return {jQuery} Element to preview with loading element nested.
				 */
				getPreviewPlaceHolder: function() {
					let $placeholder;

					$placeholder = $( this.getHtml() );
					$placeholder.prepend( self.loadingTemplate() );

					return $placeholder;
				},

				getTitle: function() {
					let title,
						template = this.template;

					if ( template ) {
						title = template.replace( /[-_]/g, ' ' );
						title = title.charAt( 0 ).toUpperCase() + title.slice( 1 );
					}

					return title;
				}
			},

			/**
			 * Store the configuration into a new object.
			 *
			 * @since 1.4
			 */
			setConfig: function() {
				$.each( self.configs, function( gridblockId ) {
					if ( ! self.removedGridlocks[gridblockId] && this.html ) {
						delete this.html;
						this.gridblockId = gridblockId;
						this.uniqueMarkup = self.createUniqueMarkup( this.$html );
						_.extend( this, self.configMethods );
						BG.GRIDBLOCK.configs.gridblocks[gridblockId] = this;
					}
				} );
			},

			/**
			 * Add a single Gridblock Object to the config.
			 *
			 * @since 1.4
			 *
			 * @param {Object} gridblockData Gridblock Info.
			 * @param {number} index         Index of gridblock in api return.
			 */
			addGridblockConfig: function( gridblockData, index ) {
				var gridblockId = 'remote-' + index;

				gridblockData = _.defaults( gridblockData, {
					dynamicImages: true,
					gridblockId: gridblockId,
					$html: gridblockData['html-jquery']
				} );

				gridblockData.$previewHtml = gridblockData.$previewHtml || gridblockData.$html;

				delete gridblockData.html;
				delete gridblockData.preview_html;
				delete gridblockData['html-jquery'];

				_.extend( gridblockData, self.configMethods );
				BG.GRIDBLOCK.configs.gridblocks[gridblockId] = gridblockData;
			},

			/**
			 * Remove gridblock from config.
			 *
			 * @since 1.4
			 *
			 * @param  {number} gridblockId Index of gridblock.
			 */
			removeGridblock: function( gridblockId ) {
				self.removedGridlocks[gridblockId] = self.configs[gridblockId];
			},

			/**
			 * Create a string that will be used to check if 2 griblocks are the sameish.
			 *
			 * @since 1.4
			 *
			 * @param  {jQuery} $element Element to create string for.
			 * @return {string}          String with whitespace rmeoved.
			 */
			createUniqueMarkup: function( $element ) {
				$element = $element.clone();
				$element
					.find( 'img' )
					.removeAttr( 'src' )
					.removeAttr( 'data-src' )
					.removeAttr( 'class' );
				return $element[0].outerHTML.replace( /\s/g, '' );
			},

			/**
			 * Swap image with a placeholder from placehold.it
			 *
			 * @since 1.0
			 */
			setPlaceholderSrc: function( $this ) {

				// Default to 300.
				var width = $this.attr( 'data-width' ) ? $this.attr( 'data-width' ) : '300',
					height = $this.attr( 'data-height' ) ? $this.attr( 'data-height' ) : '300';

				$this.attr( 'src', 'https://placehold.it/' + width + 'x' + height + '/cccccc/?text=+' );
			},

			removeAttributionAttributes: function( $image ) {
				$image.removeAttr( 'data-boldgrid-asset-id' ).removeAttr( 'data-pending-boldgrid-attribution' );
			},

			/**
			 * Remove Gridblocks that should not be aviailable to users.
			 *
			 * @since 1.4
			 *
			 * @param  {number} gridblockId Index of gridblock.
			 */
			isSimpleGridblock: function( $html ) {
				var validNumOfDescendents = 5,
					isSimpleGridblock = false,
					$testDiv = $( '<div>' ).html( $html.clone() );

				// Remove spaces from the test div. Causes areas with only spacers to fail tests.
				$testDiv.find( '.mod-space' ).remove();

				if ( $testDiv.find( '*' ).length <= validNumOfDescendents ) {
					isSimpleGridblock = true;
				}

				$testDiv.find( '.row:not(.row .row) > [class^="col-"] > .row' ).each( function() {
					var $hr,
						$this = $( this );

					if ( ! $this.siblings().length ) {
						$hr = $this.find( 'hr' );
						if ( ! $hr.siblings().length ) {
							isSimpleGridblock = true;
							return false;
						}
					}
				} );

				// Hide empty rows.
				$testDiv
					.find( '.row:not(.row .row):only-of-type > [class^="col-"]:empty:only-of-type' )
					.each( function() {
						isSimpleGridblock = true;
						return false;
					} );

				return isSimpleGridblock;
			}
		};

	BG.GRIDBLOCK.Filter = self;
	BG.GRIDBLOCK.Filter.setupConfigs();
} )( jQuery );
