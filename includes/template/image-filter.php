<script type="text/html" id="tmpl-boldgrid-editor-image-filter">
	<div class='remote-image-error'>
		<h2>Error Loading Image</h2>
		<p>This image filter control only works on images uploaded to this WordPress.
		Try replacing this image with an image from your media library to use this control.</p>
	</div>
	<div class='choices image-filter'>
		<div class='presets'>
			<ul>
			<# _.each( data.presets, function ( preset ) { #>
				<li data-preset="{{preset.name}}" class="panel-selection">
					<img src="{{data.src}}">
					<div class="name">{{preset.title}}</div>
				</li>
			<# }); #>
			</ul>
			<a class='button activate-customize'>Custom</a>
		</div>
		<div class='customize'>
			<ul>
			<# _.each( data.customizeSettings, function ( setting, name ) { #>
				<li class='control'>
					<span class='name'>{{setting.title}}</span>
					<div class="slider" data-type="{{setting.type}}" data-control="{{name}}"></div>
				</li>
			<# }); #>
			</ul>
			<a class='button activate-presets'>Presets</a>
		</div>
	</div>
	<div class='preview'>
		<img src="{{data.fullSrc}}">
		<span class='loading'><span class="spinner is-active"></span></span>
		<a class='panel-button insert-image'>Insert Modified Image</a>
	</div>
</script>
