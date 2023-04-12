<script type="text/html" id="tmpl-boldgrid-editor-background">
	<div class='background-nav'>
		<# _.each( data.navItems, function ( navItem ) { #>
			<div data-nav-target="{{navItem.target}}" data-tooltip-inline="{{navItem.label}}" class="background-nav-item item enabled">
				<span class="dashicons dashicons-{{navItem.icon}}"></span>
			</div>
		<# }); #>
	</div>
	<div class='background-design non-legacy'>
		<# _.each( data.panelSections, function ( panelSection ) { #>
			<div data-nav-target="{{panelSection.name}}" class="background-panel-section">{{{panelSection.content}}}</div>
		<# }); #>
	</div>
</script>
