<script type="text/html" id="tmpl-boldgrid-editor-color">
	<# if ( data.colors.length ) { #>
	<div class='theme-colors-wrap' data-tooltip-id='color-theme'>
		<h4>Theme Colors</h4>
		<ul class='colors theme-colors'>
			<# _.each( data.colors, function ( preset ) { #>
				<li data-type="default" data-preset="{{preset.paletteNum}}" style='background-color:{{preset.color}}' class="panel-selection"></li>
			<# }); #>
		</ul>
	</div>
	<# } #>
	<div data-tooltip-id='color-saved'>
		<h4>My Colors</h4>
		<ul class='colors my-colors'>
			<li class='panel-selection custom-color'><i class="fa fa-plus" aria-hidden="true"></i></li>
			<# _.each( data.customColors, function ( customColor, index ) { 
				if ( customColor.includes( 'linear-gradient' ) ) {
					return;
				}
				#>
				<li data-type="custom" data-index="{{index}}" data-preset="{{customColor}}" style='background-color:{{customColor}}' class="panel-selection"></li>
			<# }); #>
		</ul>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-color-panel">
<div class='color-panel editor-panel'>
<div class='panel-title'>
	<span>Color Picker</span>
	<span class="dashicons dashicons-no-alt close-icon"></span>
</div>
<div class='color-control'>
	<div class='colors-wrap'>
	</div>
	<div class='color-picker-wrap'>
		<input type="text" data-alpha="true" class='boldgrid-color-picker' value="#d41d1d" />
		<div class="links">
			<a href='#' class='cancel'>Remove</a>
		</div>
	</div>
</div>
</div>
</script>
