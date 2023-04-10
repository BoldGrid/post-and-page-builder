<script type="text/html" id="tmpl-boldgrid-editor-background">
	<div class='background-nav'>
		<# _.each( data.navItems, function ( navItem ) { #>
			<div data-nav-target="{{navItem.target}}" data-tooltip-inline="{{navItem.label}}" class="background-nav-item item enabled">
				<span class="dashicons dashicons-{{navItem.icon}}"></span>
			</div>
		<# }); #>
	</div>
	<div class='background-design'>
		<div class="background-panel-section" data-target="background-color">Background Color</div>
		<div class="background-panel-section" data-target="background-image">Background Image</div>
		<div class="background-panel-section" data-target="background-blending">Background Blending</div>
	</div>
</script>
