<script type="text/html" id="tmpl-boldgrid-editor-icon">
	<div class='choices icon-control'>
		<div class='presets supports-customization'>
			<div class='search'>
				<input type='text' class='search-input' placeholder='Search Icons' />
			</div>
			<ul class="icon-controls">
			<# _.each( data.presets, function ( preset ) { #>
				<li class="panel-selection"><i class="{{preset.class}}"></i><span class="name">{{preset.name}}</span></li>
			<# }); #>
			</ul>
		</div>
		<div class='customize'>
			<div class='back'>
				<a class='panel-button' href="#"><i class="fa fa-chevron-left" aria-hidden="true"></i> Change Icon</a>
			</div>
		</div>
	</div>
</script>
