import './view/settings/style.scss';
import { MatSelect } from '@boldgrid/controls/src/controls/mat-select';
import { Editor } from './settings/editor';

class Settings {
	constructor() {
		this.editor = new Editor();

		this.$page = $( '.bgppb-page-settings .bg-content' );
		this.title = 'Post and Page Builder Settings';
		this.description = 'Configuration options for the BoldGrid Post and Page Builder';
	}

	init() {
		$( this.renderForm() );
	}

	renderForm() {
		let $html = $( this.getHTML() );

		$html.find( 'mat-menu' ).each( ( index, el ) => {
			let $el = $( el ),
				name = $el.attr( 'name' );

			let matMenu = new MatSelect( {
				name: `bgppb_post_type[${name}]`,
				label: $el.attr( 'label' ),
				settings: this.editor.labels,
				selected: BoldgridEditor.settings.default_editor[ name ]
			} );

			$el.replaceWith( matMenu.render() );
		} );

		this.$page.find( 'bgppb-settings-form' ).replaceWith( $html );
	}

	getPageBanner( pageTitle, description ) {
		let $el = $( `
			<div class="boldgrid-page-banner">
				<div class="branding">
					<img src="https://ps.w.org/post-and-page-builder/assets/icon-128x128.png">
					<div class="version">Version: ${BoldgridEditor.pluginVersion}</div>
				</div>
				<div class="page-title">
					<h1>${pageTitle}</h1>
					<p>${description}</p>
				</div>
			</div>
		` );

		this.applyBackgroundColor( $el, 2 );

		return $el[0].outerHTML;
	};

	applyBackgroundColor( $el, colorNum ) {
		if ( BoldgridEditor.adminColors ) {
			$el.css( 'cssText', `
				background-color: ${BoldgridEditor.adminColors.colors[ colorNum ]};
				color: ${BoldgridEditor.adminColors.icon_colors.current};
			` );
		}
	}

	getCPTInputs() {
		return  BoldgridEditor.customPostTypes.map(
			type => `<mat-menu name="${type.value}" label="${type.label}" />` ).join( '' );
	}

	getHTML() {
		return `
			${this.getPageBanner( this.title, this.description ) }
			<div class="card">
				<form method="POST">
					<input type="hidden" name="bgppb-form-action" value="default_editor">
					<h2>Default Editor</h2>
					<p>
						Choose the way default way to edit your content.
						You can also choose an editor for a specific post by selecting it within the
						editor.
					</p>
					<div class="post-type-category">
						<h4>Default Post Types</h4>
						<mat-menu name="post" label="Posts" />
						<mat-menu name="page" label="Pages" />
					</div>
					<div class="post-type-category">
						<h4>Custom Post Types</h4>
						${ this.getCPTInputs() }
					</div>
					<div>
						<button class="button-primary">Submit</button>
					</div>
				</form>
			</div>
		`;
	}
}

new Settings().init();
