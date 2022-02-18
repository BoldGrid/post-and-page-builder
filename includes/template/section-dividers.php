<script type="text/html" id="tmpl-boldgrid-editor-section-dividers">
	<div class='section-divider-design' data-filter="top">
			<div class="filters">
				<a href="#" data-filter="top" data-label="Top" class="filter selected"><i class="fa fa-arrow-up" aria-hidden="true"></i> Top</a>
				<a href="#" data-filter="bottom" data-label="Bottom" class="filter"><i class="fa fa-arrow-down" aria-hidden="true"></i> Bottom</a>
			</div>
		<div class="section section-divider">
			<p class="description">Section dividers allow you to choose a shaped divider between BoldGrid Sections.
				The section divider will inherit the color of the adjacent section.
				When adding section dividers to header templates, the correct color will not show in the editor, but will show
				the correct color when viewed on the front end.</p>
			<h3 data-type="top">Top Divider</h4>
			<h3 data-type="bottom" >Bottom Divider</h4>
			<div data-type="top" data-tooltip-id='top-divider-width' class='top-divider-width section'>
					<h4>Divider Width (%)</h4>
					<div class="slider"></div>
					<span class='value'></span>
			</div>
			<div data-type="top" data-tooltip-id='top-divider-height' class='top-divider-height section'>
					<h4>Divider Height (px)</h4>
					<div class="slider"></div>
					<span class='value'></span>
			</div>
			<div data-type="bottom" data-tooltip-id='bottom-divider-width' class='bottom-divider-width section'>
					<h4>Divider Width (%)</h4>
					<div class="slider"></div>
					<span class='value'></span>
			</div>
			<div data-type="bottom" data-tooltip-id='bottom-divider-height' class='bottom-divider-height section'>
					<h4>Divider Height (px)</h4>
					<div class="slider"></div>
					<span class='value'></span>
			</div>
			<div data-type="top" class="top-divider-flip">
				<h4>Flip Horizontally</h4>
				<select data-type="top" class="flip-select" name="section-divider-top-flip">
					<option value="no" >No</option>
					<option value="yes">Yes</option>
				</select>
			</div>
			<div data-type="bottom" class="bottom-divider-flip">
				<h4>Flip Horizontally</h4>
				<select data-type="bottom" class="flip-select" name="section-divider-bottom-flip">
					<option value="no" >No</option>
					<option value="yes">Yes</option>
				</select>
			</div>
			<h4>Shape</h4>
			<ul class="divider-shapes">
				<li data-type="top" class="divider-shape">
					<input data-type="top" id="divider-top-shape-none" type="radio" name="divider-top-shape" checked value="none" >
					<label data-type="top" for="divider-top-shape-none">None</label>
				</li>
				<li data-type="bottom" class="divider-shape">
					<input data-type="bottom" id="divider-bottom-shape-none" type="radio" name="divider-bottom-shape" checked value="none" >
					<label data-type="bottom" for="divider-bottom-shape-none">None</label>
				</li>
			<# _.each( data.dividers, function( divider ) {
					var dataType = 'top'; #>
				<li data-type="{{dataType}}" class="divider-shape">
					<input data-type="{{dataType}}" id="divider-{{dataType}}-shape-{{divider.value}}" type="radio" name="divider-{{dataType}}-shape" value="{{divider.value}}" >
					<label data-type="{{dataType}}"  for="divider-{{dataType}}-shape-{{divider.value}}">
						<img data-type="{{dataType}}" src="{{divider.url}}">
					</label>
				</li>
				<# } ); #>
				<# _.each( data.dividers, function( divider ) {
					var dataType = 'bottom'; #>
				<li data-type="{{dataType}}" class="divider-shape">
					<input data-type="{{dataType}}" id="divider-{{dataType}}-shape-{{divider.value}}" type="radio" name="divider-{{dataType}}-shape" value="{{divider.value}}" >
					<label data-type="{{dataType}}"  for="divider-{{dataType}}-shape-{{divider.value}}">
						<img data-type="{{dataType}}" src="{{divider.url}}">
					</label>
				</li>
				<# } ); #>
			</ul>
		</div>
	</div>
</script>
