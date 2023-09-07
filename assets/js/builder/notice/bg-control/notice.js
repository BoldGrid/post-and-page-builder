import { Base } from '../base.js';

export class Notice extends Base {
	constructor() {
		super();

		this.name = 'bg_control';

		this.panel = {
			title: 'BoldGrid Post and Page Builder - New Feature',
			height: '345px',
			width: '675px',
			disabledClose: true,
			autoCenter: true
		};
	}

	/**
	 * Open the panel.
	 *
	 * @since 1.9.0
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
	 * Get HTML for the notice.
	 *
	 * @since 1.9.0
	 *
	 * @return {string} Template markup.
	 */
	getHTML() {
		return `
			<div class="market-notice base-notice">
				<div class="graphic">
					<img src="${BoldgridEditor.plugin_url}/assets/image/notice/plugin-icon-editor.png">
				</div>
				<div class="message">
					<h2>
						<span>Feature Update:</span>
						<span>Background Controls</span>
					</h2>
					<p>
						The background controls have been updated to add new features, such as better gradient controls, and
						better utilization of theme color variables. <a
						href="https://boldgrid.com/support/page-builder/how-to-change-backgrounds-in-the-post-and-page-builder/"
						target="_blank">Check out our support article for more information.</a>
					</p>
					<p class="buttons">
						<a class='btn bg-editor-button btn-rounded bg-primary-color dismiss'>Okay, Got It!</a>
					</p>
				</div>
			</div>
		`;
	}
}
