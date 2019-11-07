var BG = window.BOLDGRID.EDITOR;

import EditorWidth from './tinymce/width';
import StyleUpdater from './style/updater';
import LoadingGraphic from './tinymce/loading';
import { Palette } from './controls/color/palette';
import { Loader } from './notice/loader';
import { Save as LibrarySave } from './library/save';
import { Advanced } from './controls/element/advanced';
import { Lead as GridblockLead } from './gridblock/lead';
import ContentPopover from './popover/content';
import ColumnPopover from './popover/column';
import RowPopover from './popover/row';
import SectionPopover from './popover/section';
import { Navigation as CustomizeNavigation } from './customize/navigation';
import { View } from './view';
import { ConnectKey } from './connect-key/prompt';
import { Add as AddComponent } from './component/add';
import { Component as LayoutComponent } from './component/layout/component';
import { EventEmitter } from 'eventemitter3';
import { Generate } from '@boldgrid/controls/src/controls/color';
import { Sanitize } from './sanitize';
import { EditorSelect } from '../forms/editor-select';
import Compatibility from './compatibility/loader';

export class Service {
	init() {

		// Services.
		this.editorWidth = null;
		this.styleUpdater = null;
		this.event = new EventEmitter();
		this.sanitize = new Sanitize();

		this._onWindowLoad();
		this._onEditorLoad();
		this._onEditorPreload();

		return this;
	}

	/**
	 * Services to load when the window loads.
	 *
	 * @since 1.6
	 */
	_onWindowLoad() {
		this.loading = new LoadingGraphic().init();
		this.editorWidth = new EditorWidth().init();
		this.colorCalculation = new Generate();

		new EditorSelect().init();
		new View().init();
	}

	/**
	 * Services to load when the editor loads.
	 *
	 * @since 1.6
	 */
	_onEditorLoad() {
		BOLDGRID.EDITOR.$window.on( 'boldgrid_editor_loaded', () => {
			this.styleUpdater = new StyleUpdater( BOLDGRID.EDITOR.Controls.$container ).init();

			this.popover = {};
			this.popover.selection = false;

			this.popover.content = new ContentPopover().init();
			this.popover.column = new ColumnPopover().init();
			this.popover.row = new RowPopover().init();
			this.popover.section = new SectionPopover().init();
			this.connectKey = new ConnectKey();
			new Compatibility().init();

			BOLDGRID.EDITOR.CONTROLS.Section.init( BOLDGRID.EDITOR.Controls.$container );

			BG.GRIDBLOCK.View.getWebfonts();
		} );
	}

	/**
	 * Before controls are loaded.
	 *
	 * @since 1.6
	 */
	_onEditorPreload() {
		BOLDGRID.EDITOR.$window.on( 'boldgrid_editor_preload', () => {
			this.colorPalette = new Palette().init();

			// Init Color Control.
			BG.Controls.colorControl = BG.CONTROLS.Color.init();

			new Loader().init();
			new LibrarySave().init();
			new GridblockLead().init();
			new LayoutComponent().init();
			new Advanced().init();
			this.component = new AddComponent().init();

			BG.Service.customize = BG.Service.customize || {};
			BG.Service.customize.navigation = new CustomizeNavigation().init();
		} );
	}
}

BOLDGRID.EDITOR.Service = new Service();
BOLDGRID.EDITOR.Service.init();
