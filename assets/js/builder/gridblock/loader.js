window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

import { Save } from './save';
import { Preview } from './preview';
import { WebFont } from '@boldgrid/controls';

( function( $ ) {
	'use strict';

	var BGGB = BOLDGRID.EDITOR.GRIDBLOCK,
		BG = BOLDGRID.EDITOR,
		self = {
			$window: $( window ),

			openInit: false,

			countGidblocksLoaded: 0,

			loadingGridblocks: false,

			creatingIframe: false,

			$iframeTemp: false,

			/**
			 * Run this function the first time the view is open.
			 *
			 * @since 1.4
			 */
			firstOpen: function() {
				if ( false === self.openInit ) {
					self.openInit = true;

					BGGB.View.init();
					BGGB.Delete.init();
					BGGB.Drag.init();

					self.preview = new Preview();
					self.preview.init();

					new Save().init();
				}
			},

			/**
			 * Get a list of gridblocks that need to be rendered.
			 *
			 * @since 1.4
			 *
			 * @return {Array} List of gridblock keys to be rendered.
			 */
			getPendingGridblockIds: function() {
				var gridblockIds = [],
					currentCount = 0,
					maxPerLoad = 4;

				$.each( BGGB.configs.gridblocks, function( index ) {
					if ( ! this.renderScheduled && currentCount < maxPerLoad ) {
						if ( BGGB.Category.canDisplayGridblock( this ) ) {
							currentCount++;
							this.renderScheduled = true;
							gridblockIds.push( index );
						}
					}
				} );

				return gridblockIds;
			},

			/**
			 * Render any gridblock iframes that have yet to be loaded.
			 *
			 * @since 1.4
			 */
			loadGridblocks: function() {
				var interval,
					load,
					blocks,
					iteration = 0;

				if ( true === self.loadingGridblocks ) {
					return;
				}

				blocks = self.getPendingGridblockIds();
				if ( 0 === blocks.length ) {
					return;
				}

				self.loadingGridblocks = true;
				load = function() {
					var gridblockId = blocks[iteration],
						gridblock = gridblockId ? BGGB.configs.gridblocks[gridblockId] : false;

					if ( true === self.creatingIframe ) {
						return;
					}

					if ( ! gridblock ) {
						clearInterval( interval );
						self.loadingGridblocks = false;
						BGGB.View.$gridblockSection.trigger( 'scroll' );
						return;
					}

					if ( 'iframeCreated' !== gridblock.state ) {
						self.createIframe( gridblock );
					}

					iteration++;
				};

				interval = window.setInterval( load, 100 );
			},

			/**
			 * Given a Gridblock config, Render the coresponding iframe.
			 *
			 * @since 1.4
			 */
			createIframe: function( gridblock ) {
				var load,
					postCssLoad,
					$gridblock = BGGB.View.$gridblockSection.find(
						'[data-id="' + gridblock.gridblockId + '"]'
					),
					$iframe = self.$iframeTemp ? self.$iframeTemp : $( '<iframe></iframe>' );

				self.creatingIframe = true;
				BGGB.View.$gridblockSection.find( '.gridblocks' ).append( $gridblock );
				$gridblock.prepend( $iframe );

				load = function() {
					let content, $contents;

					BGGB.Image.translateImages( gridblock, gridblock.$html );
					BGGB.Image.translateImages( gridblock, gridblock.$previewHtml );

					// Wait for images to load and then adjust iframe height.
					setTimeout( () => {

						// When a gridblock is rendered fire the event.
						BG.Service.event.emit( 'blockRendered', gridblock );

						self.preview.adjustHeight( $iframe, $gridblock );

						// This gets a timeout because animations cause :visible to return false on MOZ.
						BG.Controls.$container.wrap_content_elements( gridblock.$previewHtml );
					}, 1000 );

					self.preview.createIframe( $iframe, {
						head: '',
						body: ''
					} );

					$contents = $iframe.contents();
					BGGB.View.addStyles( $contents );
					BGGB.View.addBodyClasses( $contents );

					$contents.find( '.content-placeholder' ).replaceWith( gridblock.$previewHtml );

					// Update google fonts link in iframe.
					new WebFont( { $scope: $contents } ).updateFontLink();

					if ( BGGB.Category.canDisplayGridblock( gridblock ) ) {
						$gridblock.css( 'display', '' );
					}

					gridblock.state = 'iframeCreated';
					gridblock.$iframeContents = $contents;

					setTimeout( function() {
						$gridblock.addClass( 'animated fadeInUp' );
						$gridblock.removeClass( 'gridblock-loading' );
						self.creatingIframe = false;
					}, 200 );
				};

				postCssLoad = function() {
					if ( false === BGGB.View.headMarkup ) {
						self.$window.on( 'boldgrid_head_styles', load );
					} else {
						load();
					}
				};

				if ( 'Firefox' === BOLDGRID.EDITOR.Controls.browser ) {
					$iframe.on( 'load', postCssLoad );
				} else {
					postCssLoad();
				}
			}
		};

	BGGB.Loader = self;
} )( jQuery );
