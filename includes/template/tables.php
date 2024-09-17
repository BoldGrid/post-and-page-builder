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
        </div>
        <h4>Responsive Options</h4>
        <div class="section section-responsive-options">
            <p class="table-responsive-xs">
                <label for="tables-responsive">
                    <input type="checkbox" class="general-table-option" name="tables-responsive-xs" id="tables-responsive-xs" value="table-responsive-xs">Responsive Table ( Phones )</label>
            </p>
            <p class="table-responsive-sm">
                <label for="tables-responsive">
                    <input type="checkbox" class="general-table-option" name="tables-responsive-sm" id="tables-responsive-sm" value="table-responsive-sm">Responsive Table ( Tablets )</label>
            </p>
            <p class="hide-header-responsive">
                <label for="hide-header-responsive">
                    <input type="checkbox" class="general-table-option" name="hide-header-responsive" id="hide-header-responsive" value="hide-header-responsive">Hide Header on Responsive Tables</label>
        </div>
        <h4>Mobile Heading Labels</h4>
        <div class="section section-heading-labels">
        </div>
        <h4>Horizontal Text Alignment</h4>
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
        <h4>Vertical Text Alignment</h4>
        <div class="section section-vertical-alignment">
            <div class="buttonset bgc" >
                <input class="switch-input screen-reader-text bgc general-table-option" 
                    data-classes="table-vertical-align-top table-vertical-align-middle table-vertical-align-bottom"
                    type="radio" value="" checked name="tables-vertical-align" id="tables-vertical-align-none">
                    <label class="switch-label switch-label-on " for="tables-vertical-align-none">
                        None
                    </label>
                <input class="switch-input screen-reader-text bgc general-table-option" 
                    data-classes="table-vertical-align-top table-vertical-align-middle table-vertical-align-bottom"
                    type="radio" value="table-vertical-align-top" name="tables-vertical-align" id="tables-vertical-align-top">
                    <label class="switch-label switch-label-on " for="tables-vertical-align-top">
                        Top
                    </label>
                <input class="switch-input screen-reader-text bgc general-table-option"
                    data-classes="table-vertical-align-top table-vertical-align-middle table-vertical-align-bottom"
                    type="radio" value="table-vertical-align-middle" name="tables-vertical-align" id="tables-vertical-align-middle">
                    <label class="switch-label switch-label-on " for="tables-vertical-align-middle">
                        Middle
                    </label>
                <input class="switch-input screen-reader-text bgc general-table-option"
                    data-classes="table-vertical-align-top table-vertical-align-middle table-vertical-align-bottom"
                    type="radio" value="table-vertical-align-bottom" name="tables-vertical-align" id="tables-vertical-align-bottom">
                    <label class="switch-label switch-label-on " for="tables-vertical-align-bottom">
                        Bottom
                    </label>
		    </div>
        </div>
        <h4>Table Borders</h4>
        <div class="section section-borders">
            <p class="table-borders">
                <label>None
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered table-bordered-columns" name="tables-borders" value="table-borderless"></label>
                <label>Rows Only
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered table-bordered-columns" name="tables-borders" value="" checked></label>
                <label>Columns Only
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered table-bordered-columns" name="tables-borders" value="table-borderless table-bordered-columns"></label>
                <label>Rows and Columns
                    <input type="radio" class="general-table-option" data-classes="table-borderless table-bordered table-bordered-columns" name="tables-borders" value="table-bordered"></label>
            </p>
        </div>
    </div>
</script>
