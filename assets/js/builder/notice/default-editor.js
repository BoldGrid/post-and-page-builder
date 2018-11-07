var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import { Base as Notice } from './base';

export class DefaultEditor extends Notice {
	constructor() {
		super();

		this.name = 'default-editor';

		this.panel = {
			title: 'Default Editor',
			height: '285px',
			width: '650px',
			disabledClose: true,
			autoCenter: true
		};
	}

	/**
	 * Run the initialization process.
	 *
	 * @since 1.6
	 */
	init() {
		if ( BoldgridEditor.display_intro ) {
			this.$body = $( 'body' );

			this.$panelHtml = $( this.getTemplateMarkup() );

			this.openPanel();
		}
	}

	getTemplateMarkup() {
		return `
			<div>
				<h4>Choose your Default Editor:</h4>
				<p></p>
				<ul>
					<li><label><input type="radio" name="bgppb-default-editor" value="bgppb">Post and Page Builder</label></li>
					<li><label><input type="radio" name="bgppb-default-editor" value="wordpress">Modern WordPress Editor</label></li>
					<li><label><input type="radio" name="bgppb-default-editor" value="classic">Classic WordPress Editor</label></li>
				</ul>
			</div>
		`;
	}

	/**
	 * Open the panel with default setting.
	 *
	 * @since 1.6
	 */
	openPanel() {
		BG.Panel.currentControl = this;
		this.$body.addClass( 'bg-editor-intro' );
		BG.Panel.setDimensions( this.panel.width, this.panel.height );
		BG.Panel.setTitle( this.panel.title );
		BG.Panel.setContent( this.$panelHtml );
		BG.Panel.centerPanel();
		BG.Panel.$element.show();
	}

	dismissPanel() {
		super.dismissPanel();

		this.settings.template.choice = this.$templateInputs.filter( ':checked' ).val();

		// If the user enters the first time setup on a page, update the meta box.
		if ( 'default' !== this.settings.template.choice ) {
			let val = 'template/page/' + this.settings.template.choice + '.php';
			$( '#page_template' )
				.val( val )
				.change();
		}

		// Make ajax call to save the given settings.
		this.saveSettings();
	}

	saveSettings() {
		$.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 10000,
			data: {
				action: 'boldgrid_editor_setup',

				// eslint-disable-next-line
				boldgrid_editor_setup: BoldgridEditor.setupNonce,
				settings: this.settings
			}
		} );
	}
}
