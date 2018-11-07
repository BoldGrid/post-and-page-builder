import './view/settings/style.scss';
import { MatSelect } from '@boldgrid/controls/src/controls/mat-select';
import { Editor } from './settings/editor';

class Settings {
	constructor() {
		this.editor = new Editor();

		this.$page = $( '.wrap.bg-content' );
		this.title = 'Post and Page Builder Settings';
		this.description = 'Configuration options for the BoldGrid Post and Page Builder';
	}

	init() {
		$( this.renderForm() );
	}

	renderForm() {
		let $html = $( this.getHTML() );

		$html.find( 'mat-menu' ).each( ( index, el ) => {
			let $el = $( el );

			let matMenu = new MatSelect( {
				name: $el.attr( 'name' ),
				label: $el.attr( 'name' ),
				settings: this.editor.labels
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

	getHTML() {
		return `
			${this.getPageBanner( this.title, this.description ) }
			<div class="card">
				<form>
					<h2>Default Editor</h2>
					<p>
						Choose the way default way to edit your content.
						You can also choose an editor for a specific post by selecting it within the
						editor.
					</p>
					<div class="wordpress-types">
						<h4>Default Post Types</h4>
						<mat-menu name="Posts" />
						<mat-menu name="Pages" />
					</div>
					<div>
						<h4>Custom Post Types</h4>
						<mat-menu name="Blocks" />
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
