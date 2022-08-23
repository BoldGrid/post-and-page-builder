<script type="text/html" id="tmpl-boldgrid-editor-button">
	<div class='choices button-design'>
		<# if ( BoldgridEditor.has_theme_buttons ) { #>
			<div class='title'>
				<h4>Theme Designs</h4>
			</div>
			<div class='presets theme-designs {{BoldgridEditor.body_class}}'>
				<ul>
				<# for ( var theme_button in BoldgridEditor.builder_config.theme_buttons ) { #>
					<li data-preset="{{BoldgridEditor.builder_config.theme_buttons[theme_button]}}" class="panel-selection">
						<a class='{{BoldgridEditor.builder_config.theme_buttons[theme_button]}}'>{{theme_button}}</a>
					</li>
				<# } #>
				</ul>
			</div>
		<# } #>
		<# if ( data.myPresets.length ) { #>
			<div class='title'>
				<h4>My Designs</h4>
			</div>
			<div class='presets my-designs'>
			<ul>
			<# _.each( data.myPresets, function ( preset ) { #>
				<li data-preset="{{preset.classes}}" class="panel-selection">
					<a class='{{preset.classes}}'>Button</a>
				</li>
			<# }); #>
			</ul>
			</div>
		<# } #>
		<div class='title'>
			<h4>Sample Designs</h4>
		</div>
		<div class='presets supports-customization'>
			<ul>
			<# _.each( data.presets, function ( preset ) { #>
				<li data-preset="{{preset.name}}" class="panel-selection">
					<a class='{{preset.name}}'>{{data.text}}</a>
				</li>
			<# }); #>
			</ul>
		</div>
		<div class='customize'>
			<div class='back'>
				<a class='panel-button' href="#"><i class="fa fa-chevron-left" aria-hidden="true"></i> Preset Designs</a>
			</div>
		<div data-control-name="design">
			<div class='section button-color-controls'>
				<h4>Color</h4>
				<div class='inline-color-controls'>
					{{{data.colors}}}
				</div>
			</div>
			<div class="section button-size-control">
				<h4>Size</h4>
				<div class="slider"></div>
				<span class='value'></span>
			</div>
			<div class='class-control button-shape section'>
				<p>Shape</p>
	    		<label><input type="radio" checked="checked" default name="button-shape" value="">Normal</label>
	    		<label><input type="radio" name="button-shape" value="btn-rounded">Rounded</label>
	    		<label><input type="radio" name="button-shape" value="btn-pill">Pill</label>
			</div>
			<div class='class-control button-raised section'>
				<p>Raised</p>
	    		<label><input type="radio" checked="checked" default name="button-raised" value="">Flat</label>
	    		<label><input type="radio" name="button-raised" value="btn-raised">Raised</label>
			</div>
			<div class='class-control button-text-shadow section'>
				<p>Text Shadow</p>
	    		<label><input type="radio" checked="checked" default name="button-text-shadow" value="">None</label>
	    		<label><input type="radio" name="button-text-shadow" value="btn-longshadow">Enabled</label>
			</div>
			<div class='class-control button-block section'>
				<p>Width</p>
	    		<label><input type="radio" checked="checked" default name="button-block" value="">Normal</label>
	    		<label><input type="radio" name="button-block" value="btn-block">Full Width</label>
			</div>
			<div class='class-control button-effect section'>
				<p>Effect</p>
	    		<label><input type="radio" checked="checked" default name="button-effect" value="">None</label>
	    		<label><input type="radio" name="button-effect" value="btn-3d">3D</label>
	    		<label><input type="radio" name="button-effect" value="btn-glow">Glow</label>
			</div>
			<div class='class-control button-shape section'>
				<p>Text Style</p>
	    		<label><input type="radio" checked="checked" default name="button-text-style" value="">Unmodified</label>
	    		<label><input type="radio" name="button-text-style" value="btn-uppercase">Uppercase</label>
	    		<label><input type="radio" name="button-text-style" value="btn-small-caps">Small Uppercase</label>
			</div>
		</div>
	</div>
</script>
