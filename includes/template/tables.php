<script type="text/html" id="tmpl-boldgrid-editor-tables">
    <div class="boldgrid-editor-tables presets supports-customization">
        <div class="section section-columns-and-rows">
            <p class="number-of-col-and-rows">
                <label for="tables-number-of-columns">Number of Columns
                    <input type="number" name="tables-number-of-columns" id="tables-number-of-columns" value="3" min="1" max="100" step="1"></label>
                <label for="tables-number-of-rows">Number of Rows
                    <input type="number" name="tables-number-of-rows" id="tables-number-of-rows" value="4" min="1" max="100" step="1"></label>
            </p>
        </div>
        <h4>Heading Labels</h4>
        <div class="section section-heading-labels">
        </div>
        <h4>General Options</h4>
        <div class="section section-general-options">
            <p class="hide-header">
            <label for="tables-hide-header">
                <input type="checkbox" class="general-table-option" name="tables-hide-header" id="tables-hide-header" value="hide-header">Hide Header</label>
            </p>
            <p class="striped-rows">
                <label for="tables-striped-rows">
                    <input type="checkbox" class="general-table-option" name="tables-striped-rows" id="tables-striped-rows" value="table-striped">Striped Rows</label>
            </p>
            <p class="table-responsive">
                <label for="tables-responsive">
                    <input type="checkbox" class="general-table-option" name="tables-responsive" id="tables-responsive" value="table-responsive">Responsive Table</label>
            </p>
        </div>
        <h4>Table Text Alignment</h4>
        <div class="section section-text-alignment">
            <div class="buttonset bgc" >
                <input class="switch-input screen-reader-text bgc general-table-option" 
                    data-classes="table-text-align-center table-text-align-right"
                    type="radio" value="" checked name="tables-text-align" id="tables-text-align-left">
                    <label class="switch-label switch-label-on " for="tables-text-align-left">
                        <span class="dashicons dashicons-editor-alignleft"></span>Left
                    </label>
                <input class="switch-input screen-reader-text bgc general-table-option"
                    data-classes="table-text-align-center table-text-align-right"
                    type="radio" value="table-text-align-center" name="tables-text-align" id="tables-text-align-center">
                    <label class="switch-label switch-label-on " for="tables-text-align-center">
                        <span class="dashicons dashicons-editor-alignleft"></span>Center
                    </label>
                <input class="switch-input screen-reader-text bgc general-table-option"
                    data-classes="table-text-align-center table-text-align-right"
                    type="radio" value="table-text-align-right" name="tables-text-align" id="tables-text-align-right">
                    <label class="switch-label switch-label-on " for="tables-text-align-right">
                        <span class="dashicons dashicons-editor-alignleft"></span>Right
                    </label>
		    </div>
        </div>
        <h4>Table Borders</h4>
        <div class="section section-borders">
            <p class="table-borders">
                <label>None
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered" name="tables-borders" value="table-borderless"></label>
                <label>Rows Only
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered" name="tables-borders" value="" checked></label>
                <label>Rows and Columns
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered" name="tables-borders" value="table-bordered"></label>
            </p>
        </div>
    </div>
</script>