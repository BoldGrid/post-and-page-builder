/**
 * File: assets/js/builder/notice/onb-videos/notice.js
 * 
 * @since 1.26.0
 * 
 * @package Editor
 * @subpackage Notice
 */
import { Base } from '../base.js';

/**
 * Onboarding Videos Notice.
 * 
 * @since 1.26.0
 */
export class Notice extends Base {
	constructor() {
		super();

		this.name = 'onb_videos';

		this.panel = {
			title: 'BoldGrid Post and Page Builder - Getting Started',
			height: '450px',
			width: '950px',
			disabledClose: true,
			autoCenter: true
		};
	}

	/**
	 * Open the panel.
	 *
	 * @since 1.26.0
	 * 
	 * @param {boolean} showPointer Show the admin pointer.
	 */
	init( showPointer = true ) {
		BG.Panel.currentControl = this;
		// Remove all content from the panel.
		BG.Panel.clear();
		BG.Panel.setDimensions( this.panel.width, this.panel.height );
		BG.Panel.setTitle( this.panel.title );
		BG.Panel.setContent( this.getHTML() );
		BG.Panel.centerPanel();
		BG.Panel.$element.show();
		this.bindVideoListButtons();
		this.bindDismissButton( showPointer );
	}

	/**
	 * Load the admin pointer.
	 * 
	 * @since 1.26.0
	 */
	loadAdminPointer() {
		var $target = $( '#boldgrid-instance-menu .fa-question' ),
			options = {
				content: '<h3> Tutorial Videos </h3> <p> You can open up the tutorial videos again by clicking here </p>',
				position: {
					edge: 'right',
					align: 'middle'
				},
				close: function() {
					$.post( ajaxurl, {
						pointer: 'onb-videos',
						action: 'dismiss-wp-pointer'
					} );
					$target.pointer( 'destroy' );
				}
			};

		if ( $( '.editing-blocker' ).is( ':visible' ) ) {
			$( '#content_ifr' ).contents().one( 'click', () => {
				$target.pointer( options ).pointer( 'open' );
			} );
		} else {
			$target.pointer( options ).pointer( 'open' );
		}
	}

	/**
	 * Bind the event of dismiss to the Okay button.
	 *
	 * @since 1.26.0
	 * 
	 * @param {boolean} showPointer Show the admin pointer.
	 */
	bindDismissButton( showPointer ) {
		BG.Panel.$element
			.find( '.bg-upgrade-notice, .setup, .base-notice' )
			.find( '.dismiss' )
			.one( 'click', ( e ) => {
				var nonce = $( e.currentTarget ).data( 'nonce' );
				super.dismissPanel();
				if ( showPointer ) {
					this.ajaxDismiss( nonce );
					this.loadAdminPointer();
				}
			} );
	}

	/**
	 * Dismiss the notice via ajax.
	 * 
	 * @since 1.26.0
	 * 
	 * @param {string} nonce Nonce.
	 */
	ajaxDismiss( nonce ) {
		$.post( ajaxurl, {
			nonce: nonce,
			action: 'boldgrid_editor_dismiss_onb_videos',
		} );
	}

	/**
	 * Bind Video List Buttons
	 * 
	 * @since 1.26.0
	 */
	bindVideoListButtons() {
		var $buttons = BG.Panel.$element.find( '.onb-videos-list .button' ),
			$iframe  = BG.Panel.$element.find( 'iframe' );

		$buttons.on( 'click', ( e ) => {
			var $button = $( e.currentTarget ),
				videoId = $button.data( 'video-id' );

			$iframe.attr( 'src', `https://www.youtube.com/embed/${videoId}` );
		} );
	}

	/**
	 * Get Video List HTML.
	 * 
	 * @since 1.26.0
	 * 
	 * @return {string} Template markup.
	 */
	getVideoListHTML() {
		var videos = BoldgridEditor.onb_videos ? BoldgridEditor.onb_videos : [];
		var html   = '<ul class="onb-videos-list">';

		videos.forEach( ( video ) => {
			html += `
				<li class="onb-video-list-item">
					<span data-video-id="${video.VideoId}" class="button button-secondary">${video.Title}</span>
				</li>
			`;
		} );

		html += '</ul>';

		return html;
	}

	/**
	 * Get Video Embed HTML.
	 * 
	 * @since 1.26.0
	 * 
	 * @return {string} Template markup.
	 */
	getVideoEmbedHTML() {
		var videos = BoldgridEditor.onb_videos ? BoldgridEditor.onb_videos : [];
		var nonce  = BoldgridEditor.onb_videos_nonce;

		if ( 0 === videos.length ) {
			return '';
		}
		
		return `
			<div class="onb-video-embed" data-video-id="${videos[0].VideoId}">
				<iframe
					width="577"
					height="325"
					src="https://www.youtube.com/embed/${videos[0].VideoId}"
					frameborder="0"
					allowfullscreen>
				</iframe>
				<p class="buttons" style="margin: 10px">
					<a data-nonce="${nonce}" class='btn bg-editor-button btn-rounded bg-primary-color dismiss'>Okay, Got It!</a>
				</p>
			</div>
		`;
	}

	/**
	 * Get HTML for the notice.
	 *
	 * @since 1.26.0
	 *
	 * @return {string} Template markup.
	 */
	getHTML() {
		var videoListHTML  = this.getVideoListHTML(),
			videoEmbedHTML = this.getVideoEmbedHTML();

		return `
			<div class="onb-videos-notice market-notice base-notice">
				<div class="onb-videos-list-container">${videoListHTML}</div>
				<div class="onb-active-video-container">${videoEmbedHTML}</div>
			</div>
		`;
	}
}
