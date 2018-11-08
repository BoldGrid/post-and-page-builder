import { MatMenu } from '@boldgrid/controls/src/controls/mat-menu';
import { Editor as EditorSetting } from '../../settings/editor';
import './editor-select.scss';

export class EditorSelect {

	constructor() {
		this.editorSetting = new EditorSetting();
	}

	/**
	 * Initializaion.
	 *
	 * @since 1.9.0
	 */
	init() {
		this.$element = $( this._getHtml() );

		this.menu = this._renderMenu();
		this._setupMenu();
		this._setupClick();

		this.$element.show();
		$( '#screen-meta-links' ).append( this.$element );
	}

	/**
	 * Handle Menu item clicks.
	 *
	 * @since 1.9.0
	 */
	_setupMenu() {
		this.$element.find( '[data-action]' ).on( 'click', ( e ) => {
			let name = $( e.currentTarget ).attr( 'data-action' );
			this.editorSetting.changeType( name );
		} );
	}

	/**
	 * Create a menu to choose editor type.
	 *
	 * @since 1.9.0
	 *
	 * @return {MatMenu} Menu Class.
	 */
	_renderMenu() {
		let matMenu = new MatMenu( {
			name: 'bgppb-choose-editor',
			options: this.editorSetting.labels.filter( choice => 'default' !== choice.value )
		} );

		this.$element.find( '.menu-container' ).append( matMenu.render() );

		return matMenu;
	}

	/**
	 * When the user clicks on the meta button, open the dropdown.
	 *
	 * @since 1.9.0
	 */
	_setupClick() {
		this.$element.find( '.current-editor' ).on( 'click', ( e ) => {
			e.preventDefault();

			if ( ! this.menu.menu.open ) {
				this.menu.show();
			}
		} );
	}

	/**
	 * Get the dropdown menu html.
	 *
	 * @since 1.9.0
	 *
	 * @return {string} HTML.
	 */
	_getHtml() {
		const editor = this.editorSetting.labels.find( ( val ) => val.name === BoldgridEditor.global_settings.current_editor );

		return `
			<div id="bgppb-choose-editor" class="screen-meta-toggle">
				<span class="label">
					<span>Editor</span>
				</span>
				<span class="current-editor show-settings button">
					${editor.label}
				</span>
				<span class="menu-container"></span>
			</div>
		`;
	}
}
