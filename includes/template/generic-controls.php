<script type="text/html" id="tmpl-boldgrid-editor-font-size">
	<div class='section size'>
		<h4>Font Size (px)</h4>
		<div class="slider"></div>
		<span class='value'></span>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-font-color">
	<div class='font-color color-controls section'>
		<h4>Color</h4>
		<label for="font-color" class='color-preview'></label>
		<input type="text" data-type="" name='font-color' class='color-control' value=''>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-insert-link">
	<div class='insert-link section'>
		<a class='panel-button insert-link'>Insert Link</a>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-margin">
	<div class='section margin-control' data-tooltip-id='box-margin'>
		<h4>Margin</h4>
		<div class='margin margin-horizontal'>
			<p>Horizontal (px)</p>
			<div class="slider"></div>
			<span class='value'></span>
		</div>
		<div class='margin-top'>
			<p>Vertical (px)</p>
			<div class="slider"></div>
			<span class='value'></span>
		</div>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-custom-classes">
	<div class='section custom-classes' data-tooltip-id='custom-classes'>
		<h4>Custom Classes</h4>
		<p>List any additional classes to add, separated by spaces or commas.</p>
		<textarea name="custom-classes" rows="3">Write something here</textarea>
	</div>
	<div class='section css-id' data-tooltip-id='css-id'>
		<h4>CSS ID</h4>
		<p>Enter an ID for this element.</p>
		<input name="css-id" type="text">
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-hover-visibility">
	<div class='section hover-visibility' data-tooltip-id='hover-visibility'>
		<h4>Hover Visibility</h4>
		<p>Determine how this element will display inside a hover box.</p>
		<label>Always Show
			<input type="radio" name="hover-visibility" value="always" checked>
		</label>
		<label>Show Only On Hover
			<input type="radio" name="hover-visibility" value="show">
		</label>
		<label>Hide Only On Hover
			<input type="radio" name="hover-visibility" value="hide">
		</label>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-full-width-rows">
	<div class='section full-width-rows' data-tooltip-id='full-width-rows'>
		<h4>Full Width Row Background</h4>
		<p>Determine if the background of this row's columns should extend to the full width of the screen.</p>
		<label>Enabled
			<input type="checkbox" name="full-width-rows">
		</label>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-horizontal-block-alignment">
	<div class='horizontal-block-alignment section' data-tooltip-id='horizontal-block-alignment'>
		<h4>Horizontal Alignment</h4>
		<label>
			<input type="radio" checked="checked" name="horizontal-block-alignment" value="left">Left
		</label>
		<label>
			<input type="radio" name="horizontal-block-alignment" value="center">Center
		</label>
		<label>
			<input type="radio" name="horizontal-block-alignment" value="right">Right
		</label>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-responsive-text-alignment">
	<div class='responsive-text-alignment section' data-tooltip-id='responsive-text-alignment'>
		<h3 class="control-title">Responsive Text Alignment</h3>
		<hr/>
		<h4 style="font-weight:600">Large Displays</h4>
		<div class="buttonset bgc" data-device="lg" >
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-lg-left" name="lg-text-alignment" id="lg-text-alignment-left">
				<label class="switch-label switch-label-on " for="lg-text-alignment-left">
					<span class="dashicons dashicons-editor-alignleft"></span>Left
				</label>
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-lg-center" name="lg-text-alignment" id="lg-text-alignment-center">
				<label class="switch-label switch-label-on " for="lg-text-alignment-center">
					<span class="dashicons dashicons-editor-alignleft"></span>Center
				</label>
				<input class="switch-input screen-reader-text bgc" type="radio" value="text-lg-right" name="lg-text-alignment" id="lg-text-alignment-right">
				<label class="switch-label switch-label-on " for="lg-text-alignment-right">
					<span class="dashicons dashicons-editor-alignleft"></span>Right
				</label>
			<input class="switch-input screen-reader-text bgc" checked="checked" type="radio" value="" name="lg-text-alignment" id="lg-text-alignment-none">
				<label class="switch-label switch-label-on " for="lg-text-alignment-none">
					None
				</label>
		</div>
		<hr/>
		<h4 style="font-weight:600">Desktop</h4>
		<div class="buttonset bgc" data-device="md" >
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-md-left" name="md-text-alignment" id="md-text-alignment-left">
				<label class="switch-label switch-label-on " for="md-text-alignment-left">
					<span class="dashicons dashicons-editor-alignleft"></span>Left
				</label>
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-md-center" name="md-text-alignment" id="md-text-alignment-center">
				<label class="switch-label switch-label-on " for="md-text-alignment-center">
					<span class="dashicons dashicons-editor-alignleft"></span>Center
				</label>
				<input class="switch-input screen-reader-text bgc" type="radio" value="text-md-right" name="md-text-alignment" id="md-text-alignment-right">
				<label class="switch-label switch-label-on " for="md-text-alignment-right">
					<span class="dashicons dashicons-editor-alignleft"></span>Right
				</label>
			<input class="switch-input screen-reader-text bgc" checked="checked" type="radio" value="" name="md-text-alignment" id="md-text-alignment-none">
				<label class="switch-label switch-label-on " for="md-text-alignment-none">
					None
				</label>
		</div>
		<hr/>
		<h4 style="font-weight:600">Tablet</h4>
		<div class="buttonset bgc" data-device="sm" >
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-sm-left" name="sm-text-alignment" id="sm-text-alignment-left">
				<label class="switch-label switch-label-on " for="sm-text-alignment-left">
					<span class="dashicons dashicons-editor-alignleft"></span>Left
				</label>
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-sm-center" name="sm-text-alignment" id="sm-text-alignment-center">
				<label class="switch-label switch-label-on " for="sm-text-alignment-center">
					<span class="dashicons dashicons-editor-alignleft"></span>Center
				</label>
				<input class="switch-input screen-reader-text bgc" type="radio" value="text-sm-right" name="sm-text-alignment" id="sm-text-alignment-right">
				<label class="switch-label switch-label-on " for="sm-text-alignment-right">
					<span class="dashicons dashicons-editor-alignleft"></span>Right
				</label>
			<input class="switch-input screen-reader-text bgc" checked="checked" type="radio" value="" name="sm-text-alignment" id="sm-text-alignment-none">
				<label class="switch-label switch-label-on " for="sm-text-alignment-none">
					None
				</label>
		</div>
		<hr/>
		<h4 style="font-weight:600">Phone</h4>
		<div class="buttonset bgc" data-device="xs" >
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-xs-left" name="xs-text-alignment" id="xs-text-alignment-left">
				<label class="switch-label switch-label-on " for="xs-text-alignment-left">
					<span class="dashicons dashicons-editor-alignleft"></span>Left
				</label>
			<input class="switch-input screen-reader-text bgc" type="radio" value="text-xs-center" name="xs-text-alignment" id="xs-text-alignment-center">
				<label class="switch-label switch-label-on " for="xs-text-alignment-center">
					<span class="dashicons dashicons-editor-alignleft"></span>Center
				</label>
				<input class="switch-input screen-reader-text bgc" type="radio" value="text-xs-right" name="xs-text-alignment" id="xs-text-alignment-right">
				<label class="switch-label switch-label-on " for="xs-text-alignment-right">
					<span class="dashicons dashicons-editor-alignleft"></span>Right
				</label>
			<input class="switch-input screen-reader-text bgc" checked="checked" type="radio" value="" name="xs-text-alignment" id="xs-text-alignment-none">
				<label class="switch-label switch-label-on " for="xs-text-alignment-none">
					None
				</label>
		</div>
		<style>
		.bgc.buttonset {
			display: flex;
			flex-wrap: wrap;
		}
		.bgc.buttonset .switch-label {
			background: rgba(0, 0, 0, 0.1);
			border: 1px rgba(0, 0, 0, 0.1);
			color: #555d66;
			margin: 0;
			text-align: center;
			padding: 0.5em 1em;
			flex-grow: 1;
			display: -ms-flexbox;
			display: flex;
			-ms-flex-align: center;
			align-items: center;
			-ms-flex-pack: center;
			justify-content: center;
			justify-items: center;
			-ms-flex-line-pack: center;
			align-content: center;
			cursor: pointer;
		}

		.bgc.buttonset .switch-input:checked + .switch-label {
			background-color: #00a0d2;
			color: rgba(255, 255, 255, 0.8);
		}
		</style>
	</div>
</script>
<script type="text/html" id="tmpl-boldgrid-editor-generic-width">
	<div class='section width-control' data-tooltip-id='width'>
		<h4>Width (%)</h4>
		<div class='width'>
			<div class="slider"></div>
			<span class='value'></span>
		</div>
	</div>
	<div class="section full-width-rows" data-tooltip-id="full-width-rows">
		<h4>Full Width Row Background</h4>
		<div class="full-width-rows">
			<p>Determine if the background of this row's columns should extend to the full width of the screen.</p>
			<label>Enabled
				<input type="checkbox" name="full-width-rows">
			</label>
		</div>
	</div>
</script>

<script type="text/html" id="tmpl-boldgrid-editor-rotate">
	<div class='section rotate-control' data-tooltip-id='box-margin'>
		<h4>Rotate (deg)</h4>
		<div class='rotate'>
			<div class="slider"></div>
			<span class='value'></span>
		</div>
	</div>
</script>

<script type="text/html" id="tmpl-boldgrid-editor-default-customize">
	<div class='customize'>
		<div class='back'>
			<a class='panel-button' href="#"><i class="fa fa-chevron-left" aria-hidden="true"></i> Back</a>
		</div>
	</div>
</script>
