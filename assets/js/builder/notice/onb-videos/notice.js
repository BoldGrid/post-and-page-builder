import { Base } from '../base.js';

export class Notice extends Base {
	constructor() {
		super();

		this.name = 'bg_control';

		this.panel = {
			title: 'BoldGrid Post and Page Builder - Getting Started',
			height: '400px',
			width: '800px',
			disabledClose: false,
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
		this.bindDismissButton();
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
					<span data-video-id="${video.id}" class="onb-video-list-item-link">${video.title}</span>
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

		if ( empty( videos ) ) {
			return '';
		}
		
		return `
			<div class="onb-video-embed" data-video-id="${videos[0].id}">
				<iframe
					width="560"
					height="315"
					src="https://www.youtube.com/embed/${videos[0].id}"
					frameborder="0">
				</iframe>
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
		var videoListHTML  = this.getVideoListHTML();
			videoEmbedHTML = this.getVideoEmbedHTML();

		return `
			<div class="onb-videos-notice base-notice">
				<div class="onb-videos-list-container">${videoListHTML}</div>
				<div class="onb-active-video-container">${videoEmbedHTML}</div>
			</div>
		`;
	}
}
