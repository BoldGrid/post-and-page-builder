<div class="zoom-navbar zoom-navbar-top">
	<a href="#" class="connect-key-action new-connect-key">
		<span class="dashicons"></span>
		<div class="action-text">Add BoldGrid Connect</div>
	</a>
	<div class="history-controls">
		<button class='undo-link' title="Undo" type="button"><i class="mce-ico mce-i-undo"></i></button>
		<button class='redo-link' title="Redo" type="button"><i class="mce-ico mce-i-redo"></i></button>
	</div>
	<div class="bg-zoom-controls">
		<a class="exit-row-dragging">Exit GridBlock Dragging</a>
	</div>
	<div class="loading-remote">
		<div class="enabled bg-editor-loading absolute"></div>
		<span>Loading Blocks</span>
	</div>
	<span class="filter-controls">
		<span class="boldgrid-gridblock-categories block-filter">
			<label>Types</label>
			<select></select>
		</span>
		<span class="boldgrid-gridblock-industry block-filter">
			<label>Category</label>
			<select></select>
		</span>
	</span>
	<a href="#" title="Accept" class="bg-close-zoom-view">
		<span class="screen-reader-text">Accept</span>
	</a>
</div>
<div class="boldgrid-zoomout-section zoom-gridblocks-section">
	<div class="gridblocks">
		<div class="my-gridblocks-500">
			We experienced an issue retrieving your saved Blocks. We're sorry for the inconvenience.
			Please try again later.
		</div>
		<div class="my-gridblocks-404 saved">
			We didn't find any Blocks on your pages. Once you add Blocks to a post or page, it
			will show up here for your convenience.
		</div>
		<div class="my-gridblocks-404 library">
			You haven't added any Blocks to your library. When you save Blocks they will appear
			here for your convenience.
		</div>
	</div>
</div>

<script type="text/html" id="tmpl-boldgrid-editor-gridblock">
<div class="gridblock gridblock-loading"
	data-id="{{data.gridblockId}}"
	data-type="{{data.type}}"
	data-category="{{data.category}}"
	data-is-premium="{{data.is_premium ? 1 : 0}}"
	data-license="{{data.license}}"
	data-template="{{data.template}}">
	<i class="fa fa-arrows" aria-hidden="true"></i>
	<div class="add-gridblock"></div>
	<div class="premium-label">
		<img class="boldgrid-seal" src="{{BoldgridEditor.plugin_url + '/assets/image/bg-seal.png'}}">
		Premium Block
	</div>
	<div class="basic-label">
		<img class="boldgrid-seal" src="{{BoldgridEditor.plugin_url + '/assets/image/bg-seal.png'}}">
		Signup for Free Access
	</div>
	<div class="action-items">
		<i class="fa fa-heart-o save" aria-hidden="true" title="Add to Block library"></i>
	</div>
</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-gridblock-error">
<div class="gridblock-error">
	<h3>Error loading Blocks. Please try again later.</h3>
</div>
</script>

<script type="text/html" id="tmpl-boldgrid-editor-gridblock-loading">
	<div class="loading-gridblock">
		<div>Installing Block</div>
		<div class="enabled bg-editor-loading absolute"></div></div>
</script>

<script type="text/html" id="tmpl-gridblock-iframe-styles">
<style>
body, html {
	margin: 0 !important;
	padding: 0 !important;
	overflow: hidden;
}

body {
	min-height: 100%;
}

.centered-section {
	position: static !important;
}

.centered-section > *:only-of-type {
	position: absolute;
	top: 50%;
	width: 100% !important;
	max-width: 100% !important;
	transform: translateY(-50%);
}
.redacted-placeholder {
	padding: 60px 0;
	background-color: rgb(249, 249, 249);
	line-height: 1;
}
@font-face {
    font-family: "Redacted Script";
    src: url( "{{BoldgridEditor.plugin_url}}/assets/fonts/redacted/redacted-script-bold.eot");
	src: url( "{{BoldgridEditor.plugin_url }}/assets/fonts/redacted/redacted-script-bold.woff2") format("woff2"),
         url( "{{BoldgridEditor.plugin_url }}/assets/fonts/redacted/redacted-script-bold.woff") format("woff"),
         url( "{{BoldgridEditor.plugin_url }}/assets/fonts/redacted/redacted-script-bold.otf") format("opentype"),
         url( "{{BoldgridEditor.plugin_url }}/assets/fonts/redacted/redacted-script-bold.svg#filename") format("svg");
}

.redacted-placeholder {
    font-family: "Redacted Script";
    color: #cecece;
}

.background-fixed {
	background-attachment: scroll !important;
}

</style>
</script>

<script type="text/html" id="tmpl-gridblock-redacted-before">
<div class="redacted-placeholder">
	<div class="container">
		<div class="row">
			<div class="col-md-4">
				Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
				voluptatem.
			</div>
			<div class="col-md-4">
				Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
				voluptatem.
			</div>
			<div class="col-md-4">
				Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
				voluptatem.
			</div>
		</div>
	</div>
</div>
</script>

<script type="text/html" id="tmpl-gridblock-redacted-after">
<div class="redacted-placeholder">
	<div class="container">
		<div class="row">
			<div class="col-md-6">
				Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
				voluptatem. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis.
			</div>
			<div class="col-md-6">
				Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam
				voluptatem. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium
				doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore
				veritatis.
			</div>
		</div>
	</div>
</div>
</script>
