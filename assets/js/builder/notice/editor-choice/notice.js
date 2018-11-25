import { Base } from '../base.js';

export class Notice extends Base {
	constructor() {
		super();

		this.name = 'editor_choice';

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
						<span>New Feature:</span>
						<span>Preferred Editor</span>
					</h2>
					<p>
						You can now select your preferred editor.
						You can also select a specific editor directly from within a page, post, or block. Visit
						<a href="${BoldgridEditor['admin-url']}edit.php?post_type=bg_block&page=bgppb-settings">
						Post and Page Builder Settings</a> to set your defaults or view
						our <a href="${BoldgridEditor.plugin_configs.urls.support_default_editor}"
							target="_blank">support article</a> to learn more.
					</p>
					<p class="buttons">
						<a class='btn bg-editor-button btn-rounded bg-primary-color dismiss'>Okay, Got It!</a>
					</p>
				</div>
			</div>
		`;
	}
}
