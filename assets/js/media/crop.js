/**
 * The file contains the BoldgridEditor.crop object, which is used to crop
 * images when editing a page.
 *
 * @summary		Crop files within the editor.
 *
 * @since		1.0.8
 * @requires	jquery.imgareaselect.js
 */

var BOLDGRID = BOLDGRID || {};
BOLDGRID.EDITOR = BOLDGRID.EDITOR || {};

/**
 * Post and Page Builder Crop.
 *
 * This class handles the front-end functionality for suggesting to users they
 * crop an image when replacing another image with different dimensions within
 * the editor.
 *
 * @since 1.0.8
 */
BOLDGRID.EDITOR.Crop = function( $ ) {
	var self = this;

	/**
	 * A wp.media modal window.
	 *
	 * @since 1.0.8
	 * @property object self.modal Our crop modal.
	 */
	self.modal;

	/**
	 * Crop coordinates.
	 *
	 * @since 1.0.9
	 * @property object self.selectedCoordinates Coordiantes user wants to corp.
	 */
	self.selectedCoordinates = null;

	/**
	 * Image tags.
	 *
	 * @since 1.0.8
	 * @property object The original (being replaced) and new image (replacing).
	 *
	 */
	self.newImage = false;
	self.oldImage = false;

	/**
	 * @summary Clear the modal.
	 *
	 * Remove and empty certain containers that are note needed.
	 *
	 * @since 1.0.8
	 */
	this.modalClear = function() {

		/**
		 * If we previously faded out the media modal, its display is none.
		 * Reset the display.
		 */
		self.$mediaModal.css( 'display', 'block' );

		// Empty the contents of the content frame.
		self.$modalContent.empty();

		// Empty the toolbar.
		self.$modalToolbar.empty();

		// Show a message that we're comparing our two images.
		var template = wp.template( 'suggest-crop-compare' );
		self.$modalContent.html( template() );
	};

	/**
	 * @summar Crop an image.
	 *
	 * Makes an ajax call to crop an image.
	 *
	 * @since 1.0.8
	 */
	this.crop = function() {

		// Disable the skip button. We're cropping, there's no turning back.
		self.$skipButton.prop( 'disabled', true );

		/**
		 * Disable the crop button so the user can't click it again. Set its
		 * text to "Cropping".
		 */
		self.$primaryButton.prop( 'disabled', true ).text( 'Cropping...' );

		var data = {
			action: 'suggest_crop_crop',
			cropDetails: self.selectedCoordinates,
			path: self.$selectDimensions.find( 'option:selected' ).val(),
			originalWidth: $( self.oldImage )[0].naturalWidth,
			originalHeight: $( self.oldImage )[0].naturalHeight,
			id: self.$selectDimensions.attr( 'data-id' )
		};

		$.post( ajaxurl, data, function( response ) {

			// Validate our response and take action.
			self.cropValidate( response );
		} );
	};

	/**
	 * @summary Steps to take when a crop fails.
	 *
	 * @since 1.0.8
	 */
	this.cropInvalid = function() {
		var template = wp.template( 'suggest-crop-invalid' );
		self.$modalToolbar.html( template() );

		// When the user clicks the "OK" button, close the modal.
		$( 'button.crop-fail' ).on( 'click', function() {
			self.modal.close();
		} );
	};

	/**
	 * @summary Validate response after cropping image.
	 *
	 * After an ajax request to crop an image, validate the response.
	 *
	 * @since 1.0.8
	 *
	 * @param string response An ajax response.
	 */
	this.cropValidate = function( response ) {

		// Abort if ajax failed.
		if ( '0' === response ) {
			self.cropInvalid();
			return;
		}

		// JSON.parse our ajax response. Abort if this fails.
		try {
			response = JSON.parse( response );
		} catch ( e ) {
			self.cropInvalid();
			return;
		}

		/**
		 * Make sure we have all the necessary properties. If we don't, then the
		 * data is invalid.
		 */
		var validProperties = true;
		var neededProperties = [ 'new_image_height', 'new_image_width', 'new_image_url' ];

		$.each( neededProperties, function( key, property ) {
			if ( response[property] === undefined ) {
				validProperties = false;
				return false;
			}
		} );

		if ( validProperties ) {
			self.cropValid( response );
		} else {
			self.cropInvalid();
		}
	};

	/**
	 * @summary Steps to take when an image is cropped successfull.
	 *
	 * @since 1.0.8
	 *
	 * @param object response A json.parsed ajax response.
	 */
	this.cropValid = function( response ) {

		// Get the currently selected text.
		var node = tinyMCE.activeEditor.selection.getNode();

		// Adjust the src, width, and height of the new image.
		node.src = response.new_image_url;
		node.width = response.new_image_width;
		node.height = response.new_image_height;
		node.setAttribute( 'data-mce-src', response.new_image_url );

		// Reset our crop and skip buttons.
		self.$skipButton.prop( 'disabled', false );
		self.$primaryButton.prop( 'disabled', false ).text( $( this ).attr( 'data-default-text' ) );

		// Close our modal, we're done.
		self.modal.close();
	};

	/**
	 * @summary Set our image data.
	 *
	 * Our "image data" is data about both our original image and the image
	 * we're replacing it with. Example image data can be found at the top of
	 * this document above the declaration of self.newImage.
	 *
	 * This method is triggered by this.onReplace(), which is triggered when a
	 * user clicks either the "Insert into page" or "Replace" buttons.
	 *
	 * @link http://pastebin.com/Bj0NFusU Example imageData object.
	 * @since 1.0.8
	 *
	 * @param object imageData Info on old and new image.
	 */
	this.setImages = function( imageData ) {
		var oldImg = new Image(),
			newImg = new Image(),
			template = wp.template( 'suggest-crop-sizes' ),
			data = {
				action: 'suggest_crop_get_dimensions',
				attachment_id: imageData.attachment_id,
				originalWidth: imageData.customWidth,
				originalHeight: imageData.customHeight
			};

		jQuery.post( ajaxurl, data, function( response ) {

			/**
			 * Validate our response. If invalid, the modal will close and the
			 * user will continue as if nothing happened.
			 */
			if ( '0' === response ) {
				self.modal.close();
				return false;
			}

			try {
				response = JSON.parse( response );
			} catch ( e ) {
				self.modal.close();
				return false;
			}

			/**
			 * Create our <select> element filled with image sizes of our new
			 * image.
			 */
			self.$selectDimensions = $( template( response ) );
			self.$selectDimensions.attr( 'data-id', imageData.attachment_id );

			// Get the old image, the image we're replacing.
			oldImg.onload = function() {
				self.oldImage = oldImg;

				self.selectBestFit();

				/**
				 * Get the new image, the image we've chosen as a replacement.
				 * We've waited up until this point to get the data, as
				 * self.bestSizeSelector (used below) was not set until
				 * self.selectBestFit() (used above) finished running.
				 */
				newImg.onload = function() {
					self.newImage = newImg;

					self.compareImages();
				};
				newImg.src = self.bestSizeSelector;
			};
			oldImg.src = imageData.originalUrl;
		} );
	};

	/**
	 * @summary Select our best image size.
	 *
	 * Within our 'select' of image dimensions available, select by default the
	 * image of best fit.
	 *
	 * @since 1.0.9
	 */
	this.selectBestFit = function() {

		/**
		 * Determine the orientation of our old image. Portrait is > 1,
		 * Landscape is < 1, Square is 0.
		 */
		var orientation = parseFloat( self.oldImage.width / self.oldImage.height ),
			$bestSizes;

		/**
		 * From the list of available sizes, select the ones that are a best
		 * fit. If Landscape, width is the important factor, and vice versa.
		 */
		if ( 1 > orientation ) {
			$bestSizes = self.$selectDimensions.find( 'option' ).filter( function() {
				return $( this ).attr( 'data-height' ) >= self.oldImage.height;
			} );
		} else {
			$bestSizes = self.$selectDimensions.find( 'option' ).filter( function() {
				return $( this ).attr( 'data-width' ) >= self.oldImage.width;
			} );
		}

		/**
		 * Set self.bestSizeSelector to the URL of the best size. The best size
		 * is essentially one size higher than a perfect fix.
		 */
		if ( 1 === $bestSizes.length ) {
			self.bestSizeSelector = $bestSizes.eq( 0 ).val();
		} else if ( 0 === $bestSizes.length ) {
			self.bestSizeSelector = self.$selectDimensions
				.find( 'option' )
				.last()
				.val();
		} else {
			self.bestSizeSelector = $bestSizes.eq( 1 ).val();
		}

		// Select the best sized <option> in our <select>.
		self.$selectDimensions
			.find( 'option[value="' + self.bestSizeSelector + '"]' )
			.prop( 'selected', true );
	};

	/**
	 * @summary Select an area on our new image.
	 *
	 * When the "Crop Image" modal loads, by default we want an area already
	 * selected. This method does just that.
	 *
	 * @link http://odyniec.net/projects/imgareaselect/usage.html Info on imgAreaSelect.
	 * @since 1.0.8
	 */
	this.selectCoordinates = function() {
		self.setDefaultCoordinates(
			self.oldImage.width,
			self.oldImage.height,
			self.newImage.width,
			self.newImage.height
		);

		// After adding the image, bind imgAreaSelect to it.
		self.ias = self.$suggestCrop.imgAreaSelect( {
			aspectRatio: self.defaultCoordinates.aspectRatio,

			// When there's a selection within the image, show the drag handles.
			handles: true,
			imageHeight: self.newImage.height,
			imageWidth: self.newImage.width,
			instance: true,
			keys: true,
			persistent: true,
			parent: self.$modalContent.find( '.container-crop .left' ),

			// Set the default area to be selected.
			x1: self.defaultCoordinates.x1,
			y1: self.defaultCoordinates.y1,
			x2: self.defaultCoordinates.x2,
			y2: self.defaultCoordinates.y2,
			onInit: function( img, selection ) {
				self.setSelectedCoordinates( img, selection );
			},
			onSelectEnd: function( img, selection ) {
				self.setSelectedCoordinates( img, selection );
			}
		} );
	};

	/**
	 * Init.
	 *
	 * @since 1.0.8
	 */
	this.init = function() {};

	/**
	 * @summary Actions to take when an image is inserted into the editor.
	 *
	 * Images are inserted into the editor when the user clicks either the
	 * "Replace" or "Insert into page" buttons.
	 *
	 * This method is binded to the click of the "Replace" and "Insert into
	 * page" buttons.
	 *
	 * @link http://pastebin.com/izZzzWAy Example imageData object.
	 * @since 1.0.8
	 *
	 * @param object imageData Info on old and new image.
	 */
	this.onReplace = function( imageData ) {
		self.modalOpen();
		self.setImages( imageData );
	};

	/**
	 * @summary Maintain crop selection on window resize.
	 *
	 * @since 1.0.9
	 */
	this.onResize = function() {

		// Only run if the modal is visible.
		if ( self.$modalContent.is( ':visible' ) ) {
			self.ias.setOptions( {
				imageHeight: self.newImage.naturalHeight,
				imageWidth: self.newImage.naturalWidth,
				x1: self.selectedCoordinates.x1,
				y1: self.selectedCoordinates.y1,
				x2: self.selectedCoordinates.x2,
				y2: self.selectedCoordinates.y2
			} );
		}
	};

	/**
	 * @summary When an image size is changed, take action.
	 *
	 * @since 1.0.9
	 *
	 * @listens .suggest-crop:load
	 *
	 * @param string imgSrc URL of image to crop.
	 */
	this.onSize = function( imgSrc ) {
		var newImage;

		self.$suggestCrop
			.off( 'load' )
			.attr( 'src', imgSrc )
			.on( 'load', function() {
				newImage = $( this )[0];

				// img1 is the old image, the image we're replacing.
				img1Width = self.oldImage.width;
				img1Height = self.oldImage.height;

				// img2 is this image, the new image.
				img2Width = newImage.naturalWidth;
				img2Height = newImage.naturalHeight;

				/**
				 * Pass all of the above data and calculate which area of the image
				 * we should select and highlight by default.
				 */
				self.setDefaultCoordinates( img1Width, img1Height, img2Width, img2Height );

				self.ias.setOptions( {
					aspectRatio: self.defaultCoordinates.aspectRatio,
					imageHeight: newImage.naturalHeight,
					imageWidth: newImage.naturalWidth,
					x1: self.defaultCoordinates.x1,
					y1: self.defaultCoordinates.y1,
					x2: self.defaultCoordinates.x2,
					y2: self.defaultCoordinates.y2
				} );

				self.setSelectedCoordinates( null, {
					height: newImage.naturalHeight,
					width: newImage.naturalWidth,
					x1: self.defaultCoordinates.x1,
					y1: self.defaultCoordinates.y1,
					x2: self.defaultCoordinates.x2,
					y2: self.defaultCoordinates.y2
				} );

				/**
				 * Because we're reseting the image, reset the force aspect ratio to
				 * checked.
				 */
				self.$modalContent.find( '[name="force-aspect-ratio"]' ).prop( 'checked', true );
			} );
	};

	/**
	 * @summary Create our modal.
	 *
	 * See the declaration of modal at the top of this file for more info.
	 *
	 * @since 1.0.8
	 */
	this.modalCreate = function() {
		self.modal = wp.media( {
			id: 'crop',
			title: 'Crop Image',
			button: {
				text: 'Crop Image'
			}
		} );

		/*
		 * When the modal is closed, remove it. This prevents any subsequent openings of the modal
		 * to have issues caused by old data.
		 */
		self.modal.on( 'close', function() {
			self.modal.remove();
			$( '#crop' )
				.closest( '[id*="wp-uploader-id"]' )
				.remove();
			delete self.modal;
		} );

		self.modal.open();

		self.$mediaModal = $( '.media-modal' ).last();
		self.$modalContent = self.$mediaModal.find( '.media-frame-content', '.media-modal' );
		self.$modalToolbar = self.$mediaModal.find( '.media-frame-toolbar', '.media-modal' );

		$( window ).resize( function() {
			self.onResize();
		} );
	};

	/**
	 * @summary Open our modal.
	 *
	 * @since 1.0.8
	 */
	this.modalOpen = function() {

		// If the crop frame is already created, open it and return.
		if ( self.modal ) {
			self.modal.open();
			self.modalClear();
			return;
		}

		self.modalCreate();
		self.modalClear();
	};

	/**
	 * @summary Action to take when image aspect ratios match.
	 *
	 * @since 1.0.9
	 */
	this.onMatch = function() {

		// Show a 'ratio match!' message.
		var template = wp.template( 'suggest-crop-match' );
		self.$modalContent.html( template() );

		// Give the user 1 second to read the message, then fade out.
		setTimeout( function() {
			self.$mediaModal.fadeOut( '1000', function() {
				self.modal.close();
			} );
		}, 1000 );
	};

	/**
	 * @summary Fill our modal.
	 *
	 * @since 1.0.8
	 *
	 * @listens #suggest-crop-sizes:change
	 */
	this.modalFill = function() {
		var data = {
			oldImageSrc: self.oldImage.src,
			newImageSrc: self.newImage.src,
			newContentSrc: self.bestSizeSelector
		};
		var template = wp.template( 'suggest-crop' );
		self.$modalContent.html( template( data ) );

		// After we've filled in our details, add our <select>.
		self.$suggestCrop = self.$modalContent.find( '.suggest-crop' );

		$( '.imgedit-group.imgedit-source p' )
			.last()
			.html( self.$selectDimensions );

		// Bind our select element.
		self.$selectDimensions.on( 'change', function() {
			var imgSrc = $( this ).val();
			self.onSize( imgSrc );
		} );

		var template = wp.template( 'suggest-crop-toolbar' );
		self.$modalToolbar.html( template() );

		self.bindModal();

		self.selectCoordinates();
	};

	/**
	 * @summary Set coordinates user selected.
	 *
	 * Set self.selectedCoordinates, the coordinates of the image the user has
	 * selected.
	 *
	 * See the declaration of self.selectedCoordinates at the top of this file
	 * for more info.
	 *
	 * @link http://pastebin.com/hA6Y6FJn Example img object.
	 * @link http://pastebin.com/4q2Q0nhf Example selection object.
	 * @since 1.0.8
	 *
	 * @param object img The img tag of the image we're cropping.
	 * @param object selection Coordinates the user wants to crop.
	 */
	this.setSelectedCoordinates = function( img, selection ) {
		self.selectedCoordinates = selection;
	};

	/**
	 * @summary Determine what area of the image to crop by default.
	 *
	 * @since 1.0.9
	 *
	 * @param integer img1Width Width of original image.
	 * @param integer img1Height Height of original image.
	 * @param integer img2Width Width of replacing image.
	 * @param integer img2Height Height of replacing image.
	 */
	this.setDefaultCoordinates = function( img1Width, img1Height, img2Width, img2Height ) {
		var defaultWidth,
			defaultHeight,
			data = {};

		// First, try maximizing the width.
		defaultWidth = img2Width;
		defaultHeight = img1Height * img2Width / img1Width;

		// Calculations below will center our selection.
		data.x1 = 0;
		data.y1 = ( img2Height - defaultHeight ) / 2;
		data.x2 = defaultWidth;
		data.y2 = data.y1 + defaultHeight;

		// If using 'maximum width' does not fit, then maximize our height.
		if ( defaultHeight > img2Height ) {
			defaultHeight = img2Height;
			defaultWidth = img1Width * img2Height / img1Height;

			// Calculations below will center our selection.
			data.x1 = ( img2Width - defaultWidth ) / 2;
			data.y1 = 0;
			data.x2 = data.x1 + defaultWidth;
			data.y2 = defaultHeight;
		}

		data.aspectRatio = defaultWidth + ':' + defaultHeight;

		// This data will be needed globally, so make it so.
		self.defaultCoordinates = data;
	};

	/**
	 * @summary Take action when image_data is set.
	 *
	 * This method is triggered within this.onReplace().
	 *
	 * @since 1.0.8
	 */
	this.compareImages = function() {

		// Check if our two images have the same dimensions.
		var sameDimensions =
			self.oldImage.width / self.oldImage.height === self.newImage.width / self.newImage.height;

		if ( sameDimensions ) {

			// Images have the same dimensions, so no need to suggest a crop.
			self.onMatch();
		} else {

			// Fill in our self.modal, the UI for cropping an image.
			self.modalFill();
		}
	};

	/**
	 * @summary Bind events of elements within our modal.
	 *
	 * @since 1.0.8
	 */
	this.bindModal = function() {

		/**
		 * ELEMENT: help button.
		 *
		 * Action to take when the user clicks the help button.
		 */
		$( '.imgedit-help-toggle' ).on( 'click', function() {
			$( '.imgedit-help' ).slideToggle();
		} );

		self.bindRatio();

		/**
		 * ELEMENT: 'Crop Image' and 'Skip Cropping' buttons.
		 *
		 * Actions to take when buttons in the lower toolbar are clicked.
		 */
		self.$primaryButton = self.$modalToolbar.find( '.button-primary' );

		// Enable the "Crop Image" button.
		self.$primaryButton.attr( 'disabled', false );

		// Bind the click of the "Crop Image" button.
		self.$primaryButton.on( 'click', function() {
			self.crop();
		} );

		self.$skipButton = self.$primaryButton.siblings( '.media-button-skip' );

		// Bind the click of the "Skip Cropping" button.
		self.$skipButton.on( 'click', function() {
			self.modal.close();
		} );
	};

	/**
	 * @summary Bind the 'Force aspect ratio' checkbox.
	 *
	 * @since 1.0.9
	 */
	this.bindRatio = function() {
		var $checkBox = self.$modalContent.find( '[name="force-aspect-ratio"]' );

		// If the text "Force aspect ratio" is clicked, toggle the checkbox.
		self.$modalContent.find( 'span#toggle-force' ).on( 'click', function() {
			$checkBox.click();
		} );

		// Remove any existing bindings.
		$checkBox.off( 'change' );

		$checkBox.on( 'change', function() {

			// If the checkbox is checked, force the aspect ratio.
			if ( $( this ).is( ':checked' ) ) {
				self.ias.setOptions( {
					aspectRatio: self.defaultCoordinates.aspectRatio,
					x1: self.defaultCoordinates.x1,
					y1: self.defaultCoordinates.y1,
					x2: self.defaultCoordinates.x2,
					y2: self.defaultCoordinates.y2
				} );
			} else {
				self.ias.setOptions( {
					aspectRatio: false
				} );
			}
		} );
	};
};

BOLDGRID.EDITOR.CropInstance = new BOLDGRID.EDITOR.Crop( jQuery );
