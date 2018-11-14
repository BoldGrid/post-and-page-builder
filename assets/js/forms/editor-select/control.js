import { MatMenu } from '@boldgrid/controls/src/controls/mat-menu';
import { Utility } from '../utility';
import { Loading } from '../../view/loading';
import './style.scss';

export class Control {

	constructor() {
		this.labels = [
			{ name: 'bgppb', value: 'bgppb', label: `<img src="${BoldgridEditor.plugin_url}/assets/image/boldgrid-logo.svg"/> Post and Page Builder` },
			{ name: 'modern', value: 'modern', label: 'WordPress Editor' },
			{ name: 'classic', value: 'classic', label: 'Classic Editor' },
			{ name: 'default', value: 'default', label: 'Default' }
		];

		this.loading = new Loading();
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
		this.setEditorOverrideInput( $( 'form#post' ) );
	}

	/**
	 * Change the editor type.
	 *
	 * @since 1.9.0
	 *
	 * @param  {string} editorType Editor type to swicth to.
	 */
	changeType( editorType ) {
		this.loading.show();
		new Utility().postForm( { 'bgppb_default_editor_post': editorType }, false );
		setTimeout( () => this.loading.hide(), 3000 );
	}

	/**
	 * Add an editor override input to the form.
	 *
	 * This makes sure that when a user switches from one editor to another, the
	 * editor they've chosen is saved for new posts.
	 *
	 * @since 1.9.0
	 *
	 * @param {$} $form Element.
	 */
	setEditorOverrideInput( $form ) {
		let $input = $( '<input/>' );

		$input
			.attr( 'type', 'hidden' )
			.attr( 'name', 'bgppb_default_editor_post' )
			.attr( 'value', BoldgridEditor.editor_override );

		$form.append( $input );
	}

	/**
	 * Handle Menu item clicks.
	 *
	 * @since 1.9.0
	 */
	_setupMenu() {
		this.$element.find( '[data-action]' ).on( 'click', ( e ) => {
			let name = $( e.currentTarget ).attr( 'data-action' );
			this.changeType( name );
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
			options: this.labels.filter( choice => 'default' !== choice.value )
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
		const editor = this.labels.find( ( val ) => val.name === BoldgridEditor.globalSettings.current_editor );

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
