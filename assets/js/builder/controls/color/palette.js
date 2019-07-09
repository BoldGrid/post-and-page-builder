var $ = window.jQuery,
	BG = BOLDGRID.EDITOR;

import { ColorPalette, StyleUpdater, PaletteConfiguration } from '@boldgrid/controls';

export class Palette {
	constructor() {
		this.paletteConfig = new PaletteConfiguration();

		this.name = 'Palette';

		this.panel = {
			title: 'Color Palette',
			height: '600px',
			width: '325px'
		};

		this.workerUrl =
			BoldgridEditor.plugin_url + '/assets/js/sass-js/sass.worker.js?' + BoldgridEditor.version;

		this.colorPalette = new ColorPalette( {
			includeButtonCss: BoldgridEditor.components.buttons,
			sass: {
				workerURL: this.workerUrl,
				basePath: BoldgridEditor['plugin_url'] + '/assets/scss'
			}
		} );

		this.colorPalette.init();
	}

	/**
	 * Initialize this controls, usually ryns right after the constructor.
	 *
	 * @since 1.6
	 */
	init() {
		BG.Controls.registerControl( this );

		return this;
	}

	/**
	 * Universal control setup, runs on mce or DOM loaded.
	 *
	 * @since 1.6
	 */
	setup() {
		this._setupParentLoader();
	}

	/**
	 * Open the palette customization panel.
	 *
	 * @since 1.6.0
	 */
	openPanel() {
		BG.Panel.clear();

		if ( ! this.colorPalette.initialCompilesDone ) {
			BG.Panel.showLoading();
		}

		this.renderCustomization( BG.Panel.$element.find( '.panel-body' ) );

		BG.Panel.showFooter();

		// Open Panel.
		BG.Panel.open( this );
	}

	/**
	 * Get the currently saved palette settings.
	 *
	 * @since 1.6
	 *
	 * @return {Object} Palette settings.
	 */
	getPaletteSettings() {
		let settings = this.getSavedSettings();

		if ( ! settings ) {
			settings = this.paletteConfig.createSimpleConfig();
		}

		return settings;
	}

	/**
	 * Updated palettes settings = on change, live palettes = saved after refresh.
	 *
	 * @since 1.6
	 *
	 * @return {object} Settings
	 */
	getSavedSettings() {
		return this.updatedPaletteSettings || this.getLivePalettes() || false;
	}

	/**
	 * Get the currently saved palette settings.
	 *
	 * @since 1.6
	 *
	 * @return {object} Palette settings.
	 */
	getLivePalettes() {
		let colorControls,
			paletteSettings,
			config = BoldgridEditor.control_styles.configuration;

		if ( config && config.length ) {
			colorControls = _.find( config, value => {
				return 'bg-controls-colors' === value.id;
			} );

			paletteSettings = colorControls.options ? colorControls.options.paletteSettings : false;
		}

		return paletteSettings;
	}

	/**
	 * Render the customization of color palettes.
	 *
	 * @since 1.6
	 */
	renderCustomization( $target ) {
		let $control = this.colorPalette.render( $target, this.getSavedSettings() );

		// Once the control is fully rendered run an initialization method.
		if ( ! this.colorPalette.initialCompilesDone ) {
			$control.on( 'rendered', () => {
				this.colorPalette.initialCompiles( 3 ).done( () => {
					BG.Panel.hideLoading();
				} );
			} );
		}

		// Once sass is compiled from the control, update the stylesheets.
		$control.on( 'sass_compiled', ( e, data ) => {
			BG.Service.styleUpdater.update( {
				id: 'bg-controls-colors',
				css: data.result.text,
				scss: data.scss
			} );

			this.styleUpdaterParent.update( {
				id: 'bg-controls-colors',
				css: data.result.text,
				scss: data.scss,
				priority: 60
			} );

			this._postPaletteUpdate();
		} );

		return $control;
	}

	/**
	 * Save the palette settings from control into an config we will save to the DB.
	 *
	 * @since 1.6
	 */
	_savePaletteSettings() {
		let paletteSettings;

		paletteSettings = this.paletteConfig.createSavableState(
			BOLDGRID.COLOR_PALETTE.Modify.format_current_palette_state()
		);
		BG.Service.styleUpdater.stylesState[0].options =
			BG.Service.styleUpdater.stylesState[0].options || {};
		BG.Service.styleUpdater.stylesState[0].options.paletteSettings = paletteSettings;
		BG.CONTROLS.Color.updatePaletteSettings( paletteSettings );

		this.updatedPaletteSettings = paletteSettings;
	}

	/**
	 * Process to occur after a palette updates.
	 *
	 * @since 1.6
	 */
	_postPaletteUpdate() {
		this._savePaletteSettings();
		BG.Service.styleUpdater.updateInput();
	}

	/**
	 * Setup a style loader for the parent window (wordpress admin).
	 *
	 * @since 1.6
	 */
	_setupParentLoader() {
		let configs = BoldgridEditor.control_styles.configuration || [],
			state = _.find( configs, config => {
				return 'bg-controls-colors' === config.id;
			} );

		state = state ? [ state ] : [];
		this.styleUpdaterParent = new StyleUpdater( document );
		this.styleUpdaterParent.loadSavedConfig( state );
		this.styleUpdaterParent.setup();
	}
}

export { Palette as default };
