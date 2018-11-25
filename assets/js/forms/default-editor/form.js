import './style.scss';
import { MatSelect } from '@boldgrid/controls/src/controls/mat-select';
import { EditorSelect } from '../editor-select';

export class Form {

	/**
	 * Get form for default editor.
	 *
	 * @since 1.9.0
	 *
	 * @return {$} Form Object.
	 */
	getForm() {
		let $html = $( this._getMarkup() );

		$html.find( 'mat-menu' ).each( ( index, el ) => {
			let $el = $( el ),
				name = $el.attr( 'name' );

			let matMenu = new MatSelect( {
				name: `bgppb_post_type[${name}]`,
				label: $el.attr( 'label' ),
				settings: new EditorSelect().labels,
				selected: BoldgridEditor.globalSettings.default_editor[ name ]
			} );

			$el.replaceWith( matMenu.render() );
		} );

		this.$form = $html;

		return this.$form;
	}

	/**
	 * Get the form markup.
	 *
	 * @since 1.9.0
	 *
	 * @return {string} Page HTML.
	 */
	_getMarkup() {
		return `
			<form method="POST" class="bgppb-default-editor">
				<input type="hidden" name="bgppb-form-action" value="default_editor">
				<h2>Preferred Editor</h2>
				<p>
					The BoldGrid Post and Page Builder is recommended for all types of content,
					but you can change this if needed.  You can also select a specific editor
					directly from within a page, post, or block. To learn more about this feature visit our
					<a target="_blank" href="${BoldgridEditor.plugin_configs.urls.support_default_editor}">support article</a>.
				</p>
				<div class="post-type-category native">
					<h4>WordPress Post Types</h4>
					<mat-menu name="post" label="Posts" />
					<mat-menu name="page" label="Pages" />
				</div>
				<div class="post-type-category cpt">
					<h4>Custom Post Types</h4>
					${ this._getCPTInputs() }
				</div>
				<div>
					<button class="button-primary">Submit</button>
				</div>
			</form>
		`;
	}

	/**
	 * Create an input for each custom post type.
	 *
	 * @since 1.9.0
	 *
	 * @return {array} List of Posts.
	 */
	_getCPTInputs() {
		return  BoldgridEditor.customPostTypes.map(
			type => `<mat-menu name="${type.value}" label="${type.label}" />` ).join( '' );
	}
}
