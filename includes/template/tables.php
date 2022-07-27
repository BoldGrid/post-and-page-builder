<script type="text/html" id="tmpl-boldgrid-editor-tables">
    <div class="boldgrid-editor-tables presets supports-customization">
        <div class="section section-columns-and-rows">
            <p class="number-of-columns">
                <label for="tables-number-of-columns">Number of Columns</label>
                <input type="number" name="tables-number-of-columns" id="tables-number-of-columns" value="3" min="1" max="100" step="1">
            </p>
            <p class="number-of-rows">
                <label for="tables-number-of-rows">Number of Rows</label>
                <input type="number" name="tables-number-of-rows" id="tables-number-of-rows" value="4" min="1" max="100" step="1">
            </p>
        </div>
        <div class="section section-general-options">
            <p class="hide-header">
                <label for="tables-hide-header">Hide Header</label>
                <input type="checkbox" name="tables-hide-header" id="tables-hide-header" value="hide-header">
            </p>
            <p class="striped-rows">
                <label for="tables-striped-rows">Striped Rows</label>
                <input type="checkbox" name="tables-striped-rows" id="tables-striped-rows" value="table-striped">
            </p>
            <p class="hover-rows">
                <label for="tables-hover-rows">Hover Rows</label>
                <input type="checkbox" name="tables-hover-rows" id="tables-hover-rows" value="table-hover">
            </p>
            <p class="table-text-align">
                <label>
                    <input type="radio" data-classes="table-text-align-center table-text-align-right " name="tables-text-align" value="">
                    Left
                </label>
                <label>
                <input type="radio" data-classes="table-text-align-center table-text-align-right " name="tables-text-align" value="table-text-align-center">
                    Center
                </label>
                <label>
                <input type="radio" data-classes="table-text-align-center table-text-align-right " name="tables-text-align" value="table-text-align-right">
                    Right
                </label>
            </p>
            <p class="table-borders">
                <label>
                    <input type="radio" data-classes="table-borderless table-bordered" name="tables-borders" value="">
                    Row Borders
                </label>
                <label>
                    <input type="radio" data-classes="table-borderless table-bordered" name="tables-borders" value="table-borderless">
                    No Borders
                </label>
                <label>
                    <input type="radio" data-classes="table-borderless table-bordered" name="tables-borders" value="table-bordered">
                    All Borders
                </label>
            </p>
        </div>
    </div>
</script>