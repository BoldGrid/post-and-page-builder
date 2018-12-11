window.BOLDGRID = window.BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};
BOLDGRID.EDITOR.GRIDBLOCK = BOLDGRID.EDITOR.GRIDBLOCK || {};

( function( $ ) {
	'use strict';

	var config = BoldgridEditor.builder_config.gridblock,
		BG = BOLDGRID.EDITOR,
		self = {

			/**
			 * Translate all images to encoded versions.
			 *
			 * @since 1.5
			 *
			 * @param  {Object} gridblockData Current Gridblock.
			 */
			translateImages: function( gridblockData, $html ) {
				if ( gridblockData.dynamicImages ) {
					self.replaceImages( $html );
					self.replaceBackgrounds( $html );
				} else {
					self.transferSrcAttr( $html );
				}
			},

			/**
			 * Transfer src attributes to elements.
			 *
			 * Gridblocks that halve already been installed have temporary src attributes that are
			 * only applied when previewed.
			 *
			 * @since 1.5
			 *
			 * @param  {object} gridblockData Current Gridblock.
			 */
			transferSrcAttr: function( $html ) {
				$html.find( 'img[data-src]' ).each( function() {
					var $this = $( this ),
						src = $this.attr( 'data-src' );

					$this.removeAttr( 'data-src' ).attr( 'src', src );
				} );
			},

			/**
			 * Set image attributes from gridblock response.
			 *
			 * @since 1.7.0
			 *
			 * @param {$} $img Image element.
			 * @param {string} src Path to image.
			 */
			setImageAttributes( $img, src ) {
				for ( let axis of [ 'height', 'width' ] ) {
					if ( $img.data( axis ) ) {
						$img.attr( axis, $img.data( axis ) );
						$img.removeAttr( 'data-' + axis );
					}
				}

				$img.attr( 'src', src );
			},

			/**
			 * Scan each image, replace image src with encoded version.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $gridblock Gridblock Object.
			 */
			replaceImages: function( $html ) {
				$html.find( 'img' ).each( function() {
					var $this = $( this ),
						src = $this.attr( 'data-src' );

					$this.removeAttr( 'data-src' );
					$this.attr( 'dynamicimage', '' );

					if ( ! self.isRandomUnsplash( src ) ) {
						self.setImageAttributes( $this, src );
						return;
					}

					BG.GRIDBLOCK.Filter.setPlaceholderSrc( $this );

					if ( config.disabledUnsplashImages ) {
						return;
					}

					// Get image data.
					self
						.getDataURL( src )
						.done( function( result ) {
							self.setImageAttributes( $this, result );
						} )
						.fail( function() {

							// Get the image via server.
							self
								.getRedirectURL( src )
								.done( function( result ) {
									self.setImageAttributes( $this, result );
								} )
								.fail( function() {
									BG.GRIDBLOCK.Filter.setPlaceholderSrc( $this );
								} );
						} );
				} );
			},

			/**
			 * Replace background images with encoded image. Only section for now.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $gridblock gridblock previewed.
			 */
			replaceBackgrounds: function( $gridblock ) {
				var setBackground,
					backgroundImage = $gridblock.css( 'background-image' ) || '',
					hasImage = backgroundImage.match( /url\(?.+?\)/ ),
					imageUrl = self.getBackgroundUrl( $gridblock );

				setBackground = function( result ) {
					backgroundImage = self.replaceBackgroundUrl( backgroundImage, result );
					$gridblock.css( 'background-image', backgroundImage );
				};

				if ( hasImage ) {
					$gridblock.attr( 'dynamicimage', '' );

					if ( ! self.isRandomUnsplash( imageUrl ) ) {
						return;
					}

					$gridblock.css( 'background-image', '' );

					if ( config.disabledUnsplashImages ) {
						return;
					}

					self
						.getDataURL( imageUrl )
						.done( function( result ) {
							setBackground( result );
						} )
						.fail( function() {

							// Get the image via server.
							self.getRedirectURL( imageUrl ).done( function( result ) {
								setBackground( result );
							} );
						} );
				}
			},

			/**
			 * Replace the background url with a new url.
			 *
			 * @since 1.5
			 *
			 * @param  {string} css CSS rule for background image.
			 * @param  {string} url URL to swap.
			 * @return {string}     New CSS rule with the url requested.
			 */
			replaceBackgroundUrl: function( css, url ) {
				return css.replace( /url\(.+?\)/, 'url(' + url + ')' );
			},

			/**
			 * Get the url used in a background.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $element Element with background.
			 * @return {string}          URL.
			 */
			getBackgroundUrl: function( $element ) {
				var backgroundImage = $element.css( 'background-image' ) || '';
				return backgroundImage.replace( /.*\s?url\([\'\"]?/, '' ).replace( /[\'\"]?\).*/, '' );
			},

			isRandomUnsplash: function( imageUrl ) {
				return imageUrl && -1 !== imageUrl.indexOf( 'source.unsplash' );
			},

			/**
			 * Get the url for the image based on element type.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $element Element to check.
			 * @return {string}          URL.
			 */
			getEncodedSrc: function( $element ) {
				var src = '';

				if ( self.isBackgroundImage( $element ) ) {
					src = self.getBackgroundUrl( $element );
				} else {
					src = $element.attr( 'src' );
				}

				return src;
			},

			/**
			 * Check if we are applying a background image.
			 *
			 * @since 1.5
			 *
			 * @param  {jQuery} $element Element to check.
			 * @return {boolean}         Is the element image a background.
			 */
			isBackgroundImage: function( $element ) {
				return 'IMG' !== $element[0].nodeName;
			},

			/**
			 * Add wp-image class to gridblock and apply url.
			 *
			 * @since 1.4
			 *
			 * @param {jQuery} $image Image to have attributes replaced.
			 * @param {Object} data   Image return data.
			 */
			addImageUrl: function( $image, data ) {
				var backgroundImageCss;

				$image.removeAttr( 'dynamicimage' );

				if ( self.isBackgroundImage( $image ) ) {
					backgroundImageCss = $image.css( 'background-image' ) || '';
					backgroundImageCss = self.replaceBackgroundUrl( backgroundImageCss, data.url );

					$image.attr( 'data-image-url', data.url ).css( 'background-image', backgroundImageCss );
				} else {
					$image.attr( 'src', data.url );

					// If an attachment_id is set, use it to add the wp-image-## class.
					// This class is required if WordPress is to later add the srcset attribute.
					if ( 'undefined' !== typeof data.attachment_id && data.attachment_id ) {
						$image.addClass( 'wp-image-' + data.attachment_id );
					}
				}
			},

			/**
			 * Get the base64 of an image.
			 *
			 * @since 1.5
			 *
			 * @param  {string} src Remote image path.
			 * @return {$.deferred} Deferred for callbacks.
			 */
			getDataURL: function( src ) {
				var $deferred = $.Deferred(),
					xhr = new XMLHttpRequest();

				xhr.open( 'get', src );
				xhr.responseType = 'blob';
				xhr.onload = function() {
					var contentType,
						fr = new FileReader();

					fr.onload = function() {
						contentType = xhr.getResponseHeader( 'content-type' ) || '';

						if ( 200 === xhr.status && -1 !== contentType.indexOf( 'image' ) ) {
							$deferred.resolve( this.result );
						} else {
							$deferred.reject();
						}
					};

					fr.readAsDataURL( xhr.response );
				};

				xhr.onerror = function() {
					$deferred.reject();
				};

				xhr.send();

				return $deferred;
			},

			/**
			 * Get the redirect image for an unsplash image.
			 *
			 * @since 1.5
			 *
			 * @param  {string} src Remote image path.
			 * @return {$.deferred} Deferred for callbacks.
			 */
			getRedirectURL: function( src ) {
				var $deferred = $.Deferred();

				$.ajax( {
					type: 'post',
					url: ajaxurl,
					dataType: 'json',
					timeout: 20000,
					data: {
						action: 'boldgrid_redirect_url',

						// eslint-disable-next-line
						boldgrid_gridblock_image_ajax_nonce: BoldgridEditor.grid_block_nonce,
						urls: [ src ]
					}
				} )
					.done( function( response ) {
						var image = response.data[src] || false;

						if ( image ) {
							$deferred.resolve( image );
						} else {
							$deferred.reject();
						}
					} )
					.fail( function() {
						$deferred.reject();
					} );

				return $deferred;
			},

			/**
			 * Make a call to increment the unsplash image counter.
			 *
			 * @since 1.7.3
			 *
			 * @param  {object} gridblockData Block Data.
			 */
			attributeImages: function( gridblockData ) {
				for ( let image of gridblockData.images || [] ) {
					if ( 'unsplash' === image.type ) {
						$.ajax( {
							type: 'post',
							url:
								BoldgridEditor.plugin_configs.asset_server +
								BoldgridEditor.plugin_configs.ajax_calls.download_image,
							timeout: 2000,
							data: {
								id: image.id
							}
						} );
					}
				}
			}
		};

	BG.GRIDBLOCK.Image = self;
} )( jQuery );
