import { Base } from '../base.js';

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
	 */
	init() {
		BG.Panel.currentControl = this;
		BG.Panel.setDimensions( this.panel.width, this.panel.height );
		BG.Panel.setTitle( this.panel.title );
		BG.Panel.setContent( this.getHTML() );
		BG.Panel.centerPanel();
		BG.Panel.$element.show();
		this.bindVideoListButtons();
		this.bindDismissButton();
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
					<span data-video-id="${video.id}" class="button button-secondary">${video.title}</span>
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

		if ( 0 === videos.length ) {
			return '';
		}
		
		return `
			<div class="onb-video-embed" data-video-id="${videos[0].id}">
				<iframe
					width="577"
					height="325"
					src="https://www.youtube.com/embed/${videos[0].id}"
					frameborder="0"
					allowfullscreen>
				</iframe>
				<p class="buttons" style="margin: 10px">
					<a class='btn bg-editor-button btn-rounded bg-primary-color dismiss'>Okay, Got It!</a>
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
