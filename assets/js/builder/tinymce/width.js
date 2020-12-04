var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

export class Width {
	init() {
		this.$postContainer;
		this.$resizeiframe;
		this.resizable = false;
		this.stylesheetWaitTime = 500;
		this.minWidth = 500;

		this.updateIframeUrl();

		return this;
	}

	/**
	 * Create the resizer iframe and append the HTML.
	 *
	 * @since 1.6
	 *
	 * @return {jQuery} iframeElement.
	 */
	createIframe() {
		let $resizeIframe = $( '<iframe id="resizer-iframe"></iframe>' );
		$resizeIframe.attr( 'width', window.innerWidth );
		$resizeIframe.attr( 'height', window.innerHeight );

		$( 'html' ).append( $resizeIframe );
		return $resizeIframe;
	}

	/**
	 * Try to find the posts container.
	 *
	 * @since 1.6
	 *
	 * @return {jQuery} Element wrapping post content.
	 */
	_findPostContainer() {
		let $contents = this.$resizeiframe.contents(),
			$postContainer = $contents.find( 'body' ),
			$article = $contents.find( '.post-' + BoldgridEditor.post_id + ', article' ).first(),
			$entryContent = $article.find( '.entry-content' ),
			$siteContent = $contents.find( '.site-content, #site-content' ),
			$existingSection = $article.find( '.boldgrid-section:first' );

		if ( $existingSection.length ) {
			$postContainer = $existingSection;
		} else if ( $siteContent.length ) {
			$postContainer = $siteContent;
		} else if ( $article.length ) {
			$postContainer = $article;
		} else if ( $entryContent.length ) {
			$postContainer = $entryContent;
		}

		return $postContainer;
	}

	/*
	 * Get the width from the hidden iframe.
	 *
	 * @since 1.6.3
	 */
	getWidth() {
		let width = 'auto';
		if ( this.$postContainer && this.$postContainer.width() ) {
			let calcWidth = this.$postContainer.width();
			if ( this.minWidth <= calcWidth ) {
				width = calcWidth;
			}
		}

		return width;
	}

	/**
	 * After the iframe is loaded, run this process.
	 *
	 * @since 1.6
	 */
	_postIframeProcess() {
		this.$postContainer = this._findPostContainer();
		this.resizable = this.$postContainer.length && this.$postContainer.width() ? true : false;

		if ( IMHWPB.WP_MCE_Draggable.instance && IMHWPB.WP_MCE_Draggable.instance.$window ) {
			IMHWPB.WP_MCE_Draggable.instance.resize_done_event();
		}

		BG.$window.trigger( 'boldgrid_post_width', { width: this.getWidth() } );

		setTimeout( () => BG.Service.loading.hide() );
	}

	/**
	 * Create Iframe.
	 *
	 * @since 1.6
	 */
	updateIframeUrl( url ) {
		url = url || BoldgridEditor.site_url;

		if ( ! BoldgridEditor.is_boldgrid_theme || 'post' === BoldgridEditor.post_type ) {
			if ( ! this.$resizeiframe ) {
				this.$resizeiframe = this.createIframe();
			}

			this._setIframeData( url ).done( () => {
				this._postIframeProcess();
			} );
		}
	}

	/**
	 * Load content into a reszable iframe.
	 *
	 * @since 1.6
	 */
	_setIframeData( url ) {
		let $deferred = $.Deferred();

		this.$resizeiframe[0].src = url;
		this.$resizeiframe[0].onload = function() {
			$deferred.resolve();
		};

		setTimeout( () => $deferred.resolve(), 3000 );

		return $deferred;
	}
}

export { Width as default };
