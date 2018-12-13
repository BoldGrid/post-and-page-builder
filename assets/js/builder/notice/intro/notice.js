var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import './style.scss';
import templateHtml from './template.html';
import { Base } from '../base';
import { ColorPaletteSelection } from '@boldgrid/controls';
import { DefaultEditor } from '../../../forms/default-editor';

export class Notice extends Base {
	constructor() {
		super();

		this.name = 'intro';

		this.panel = {
			title: 'Post and Page Builder - Setup',
			height: '285px',
			width: '650px',
			disabledClose: true,
			autoCenter: true
		};

		this.stepConfig = {
			boldgridTheme: [ 'welcome', 'default-editor', 'done' ],
			standard: [ 'welcome', 'default-editor', 'choose-template', 'done' ]
		};

		this.steps = BoldgridEditor.is_boldgrid_theme ?
			this.stepConfig.boldgridTheme :
			this.stepConfig.standard;
	}

	/**
	 * Run the initialization process.
	 *
	 * @since 1.6
	 */
	init() {
		this.defaultEditor = new DefaultEditor();
		this.selection = new ColorPaletteSelection();
		this.$body = $( 'body' );
		this.settings = this.getDefaults();

		this.templateMarkup = _.template( templateHtml )( {
			nonce: BoldgridEditor.setupNonce,
			stepper: this.getStepper()
		} );
		this.$panelHtml = $( this.templateMarkup );
		this.$panelHtml.find( 'default-editor-form' ).replaceWith( this.defaultEditor.getForm() );
		this.$templateInputs = this.$panelHtml.find( 'input[name="bgppb-template"]' );

		this.openPanel();
		this._setupNav();
		this._addPanelSettings( 'welcome' );
		this.bindDismissButton();
		this._setupStepActions();
	}

	/**
	 * Moethods to help with the stepper UI.
	 *
	 * @since 1.9.0
	 *
	 * @return {object} Template methods.
	 */
	getStepper() {
		let self = this;

		return {
			getLabel( step ) {
				let size = self.steps.length,
					current = self.steps.findIndex( el => step === el ) + 1;

				return `Step: ${current}/${size}`;
			},
			getNext( step ) {
				let current = self.steps.findIndex( el => step === el ) + 1;

				return self.steps[current];
			}
		};
	}

	getDefaults() {
		return {
			template: {
				choice: 'fullwidth'
			}
		};
	}

	/**
	 * Open the panel with default setting.
	 *
	 * @since 1.6
	 */
	openPanel() {
		BG.Panel.currentControl = this;
		BG.Panel.setDimensions( this.panel.width, this.panel.height );
		BG.Panel.setTitle( this.panel.title );
		BG.Panel.setContent( this.$panelHtml );
		BG.Panel.centerPanel();
		BG.Panel.$element.show();
	}

	dismissPanel() {
		this.settings.template.choice = this.$templateInputs.filter( ':checked' ).val();

		// If the user enters the first time setup on a page, update the meta box.
		if ( 'default' !== this.settings.template.choice && ! BoldgridEditor.is_boldgrid_theme ) {
			let val = 'template/page/' + this.settings.template.choice + '.php';
			$( '#page_template' )
				.val( val )
				.change();
		}

		// Make ajax call to save the given settings.
		this.saveSettings();

		super.dismissPanel();
	}

	saveSettings() {
		let $inputs = BG.Panel.$element.find( 'input, select' ),
			savedValues = $inputs.serializeArray();

		$.ajax( {
			type: 'post',
			url: ajaxurl,
			dataType: 'json',
			timeout: 20000,
			data: $inputs.serialize()
		} ).done( response => {

			// If the user changes their default editor in the setup screen, reload page to add settings.
			let inputName = `bgppb_post_type[${BoldgridEditor.post_type}]`,
				input = savedValues.find( val => val.name === inputName );

			if ( input && 'bgppb' !== input.value ) {
				window.location.reload();
			}
		} );
	}

	/**
	 * When the color palette step becomes active.
	 *
	 * @since 1.6
	 */
	_setupStepActions() {
		this.$panelHtml.on( 'boldgrid-editor-choose-color-palette', () => {
			let $control;

			$control = this.selection.create();
			this.$panelHtml.find( '.choose-palette' ).html( $control );

			$control.one( 'palette-selection', () => {
				this.$currentStep.find( '[data-action-step]' ).removeAttr( 'disabled' );
			} );

			$control.on( 'palette-selection', () => {
				this.settings.palette.choice = this.selection.getSelectedPalette();
			} );
		} );
	}

	/**
	 * Set the panel settings.
	 *
	 * @since 1.6
	 *
	 * @param {string} step Step from the panel.
	 */
	_addPanelSettings( step ) {
		this.$currentStep = this.$panelHtml.find( '[data-step="' + step + '"]' );

		// Update Panel Settings.
		BG.Panel.setTitle( this.$currentStep.data( 'panel-title' ) );
		BG.Panel.setInfo( this.$currentStep.data( 'panel-info' ) );
		BG.Panel.setDimensions(
			this.$currentStep.data( 'panel-width' ) || this.panel.width,
			this.$currentStep.data( 'panel-height' ) || this.panel.height
		);
	}

	/**
	 * Setup the handling of steps.
	 *
	 * @since 1.6
	 */
	_setupNav() {
		this.$panelHtml.find( '[data-action-step]' ).on( 'click', e => {
			let $this = $( e.target ),
				step = $this.data( 'action-step' );

			this._addPanelSettings( step );
			this.$panelHtml.trigger( 'boldgrid-editor-' + step );
			this.$panelHtml.find( '.step' ).removeClass( 'active' );

			BG.Panel.centerPanel();

			this.$currentStep.addClass( 'active' );
		} );
	}
}

export { Intro as default };
