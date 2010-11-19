function DEBUG(msg){
    console.log(msg);
}

function jsonTable(dataSource, options){
    // Hang onto the source DOM object.
    var $dataSource = $(dataSource);
    var data = {};
    var $table;
    var errors = [];
    
    var defaults = {
        baseRowHeaders: [],
        baseColumnHeaders: [],
        jsonIndent: '    ',
        customValidator: function(data, errors){
            return true;
        },
        defaultRowHeaderValue: "",
        defaultColumnHeaderValue: "",
        display: "inline",
        stripEmptyData: true,
        rule: {
            days:[],
            start:null, finish:null,
            period:null, length:null
        }
    };
    
    $.extend(defaults, options);
    
    // DEBUG(defaults);
    
    function updateDataFromSource(){
        data = JSON.parse($dataSource.val());
        
        if ($table) {
            $table.detach();
        }
        
        if (defaults.display == "inline"){
            $table = $.tmpl('table', templateData()).appendTo($dataSource.parent());
        } else {
            $table = $.tmpl('table', templateData()).appendTo('body');
        }
    }
    
    
    function getDataFromTable(){
        var newData = {};
        $table.find('input.cell-value').each(function(i, el){
            $el = $(el);
            var row = $el.attr('row');
            var column = $el.attr('column');
            if (!newData[row]){
                newData[row] = {}
            }
            if ($el.val()) {
                newData[row][column] = {rate: $el.val()};
                if (getVisibleRules(column).length > 0) {
                    newData[row][column]['rules'] = getVisibleRules(column);
                }
            }
        });
        return newData;
    }
    
    function stripEmptyData(){
        $.each(data, function(row, rowData){
            $.each(rowData, function(column, value){
                if (!value){
                    delete rowData[column];
                }
            });
            if ($.isEmptyObject(rowData)){
                delete data[row];
            }
        });
    }
    
    function updateSourceFromData(){
        console.log("Updating source from data.");
        data = getDataFromTable();
        runValidations();
        
        if (defaults.stripEmptyData){
            stripEmptyData();
        }
        if (!errors.length){
            $dataSource.val(JSON.stringify(data, null, defaults.jsonIndent));
        }
    }
    
    function runValidations(){
        // DEBUG("Running validations");
        preValidate();
        findDuplicateHeaders();
        defaults.customValidator(data, errors);
        updateErrors();
        // DEBUG("Finished running validations (" + errors.length + " errors found)");
        // if (errors.length) {
        //     DEBUG(errors);
        // }
    }
    
    function updateErrors(){
        $table.find('tr, td, th').removeClass('errors');
        $table.parent().find('.errormsg').detach();
        // DEBUG(errors);
        $.each(errors, function(i,el){
            $($(el).selector).addClass("errors");
            $($(el).selector).children().first().before('<div style="color:red;" class="errormsg">' + el.reason + "</div>")
        });
        if (errors.length){
            $table.before('<h3 style="color:red;" class="errormsg errors">Errors prevented saving</h3>');
        }
    }
    
    function templateData(){
        var result = {
            headers: getHeaderNames(),
            conditions: getConditions(),
            defaults: defaults,
            data: data
        };
        
        return result;
    }
    
    function getHeaderNames(){
        var rowHeaders = [], columnHeaders = [];
        $.each(data, function(row, rowData){
            if (!inAny(row, [rowHeaders, defaults.baseRowHeaders])){
                rowHeaders.push(row);
            }
            $.each(rowData, function(column, cell){
                if (!inAny(column, [columnHeaders, defaults.baseColumnHeaders])){
                    columnHeaders.push(column);
                }
            });
        });
        return {
            rowHeaders: $.merge(defaults.baseRowHeaders.slice(), rowHeaders.sort().reverse().slice()),
            columnHeaders: $.merge(defaults.baseColumnHeaders.slice(), columnHeaders.sort().reverse().slice())
        };
    }
    
    function getVisibleRules(conditionName) {
        var rules = [];
        $table
            .find('th.column-header input[value="' + conditionName + '"]')
                .closest('th')
                    .find('.condition-rule')
                        .each(function(i, form){
                            rules.push(form2object(form));
        });
        return rules;
    }
    
    function getVisibleHeaders($table) {
        return {
            rowHeaders: $table.find('th.row-header input.heading-value').map(function(i,x){return x.value}),
            columnHeaders: $table.find('th.column-header input.condition-name').map(function(i,x){return x.value})            
        };
    }
    
    function getRules(conditionName){
        var rules = [];
        $.each(data, function(row, rowData){
            if (rowData[conditionName] && rowData[conditionName]['rules']) {
                $.each(rowData[conditionName]['rules'], function(i, rule){
                    rules.push($.extend({}, defaults.rule, rule));
                });
                return;
            }
        });
        return rules;
    }
    
    function getConditions(){
        conditionNames = getHeaderNames()['columnHeaders'];
        conditions = {};
        $.each(conditionNames, function(i, conditionName){
            conditions[conditionName] = getRules(conditionName);
        });
        console.log(conditions);
        return conditions;
    }
    
    function inAny(value, arrays){
        // is the value in any of the passed in arrays?
        var result = false;
        $.each(arrays, function(i, val){
            if ($.inArray(value, val) > -1) {
                result = true;
                return false;
            }
        });
        return result;
    }

    function combineFields($fields, sep, innerSep){
        /*
            Given several jQuery DOM objects, combine the values they
            contain into one value, using sep as seperator.
            
            If any object is a multiple select, then combine the values
            it returns with innerSep
        */
        return $fields.map(function(i, el){
            $el = $(el);
            if ($el.attr('multiple')){
                return $el.val().join(innerSep);
            }
            return $el.val();
        }).get().join(sep);
    }
    
    
    function addRow(evt){
        evt.preventDefault();
        $.tmpl('row', {
            row:defaults.defaultRowHeaderValue,
            headers: getVisibleHeaders($table),
            data: data,
            row_id: $table.find('tr.data-row').length
        }).insertBefore($(this).closest('tr'));
        // Disable adding a new row until this one has been edited.
        // $(this).attr('disabled','disabled');
        return false;
        runValidations();

    }
    
    function addColumn(evt){
        evt.preventDefault();
        // Add a new column header.
        var column = defaults.defaultColumnHeaderValue;
        console.log(column);
        var column_id = $table.find('tr.header-row th.column-header').length;
        console.log(column_id);
        $.tmpl('column-header', {
            column: column,
            column_id: column_id,
            rules: [defaults.rule]
        }).insertBefore($(this).closest('th'));
        // Now add a cell to each row in this table.
        $table.find('tr.data-row').each(function(i, el){
            $.tmpl('cell', {
                data:{},
                row_id:i,
                row:$(el).find('th input.heading-value').val(),
                column_id: column_id,
                column: column
            }).appendTo($(el));
        });
        runValidations();
    }
    
    function updateColumnName(evt) {
        evt.preventDefault();
        var $target = $(evt.target);
        var newName = $target.val();
        var column_id = $target.attr('column_id');
        $table.find('input.cell-value').filter(function(i){
            return $(this).attr('column_id') == column_id;
        }).attr('column', newName);
    }
    
    function updateRowHeader(evt) {
        evt.preventDefault();
        var $th = $(evt.target).closest('th');
        var newValue = combineFields($th.find(':input.fragment'), ',');
        console.log(newValue);
        $th.find(':input:hidden').val(newValue);
        $th.closest('tr').find('input.cell-value').attr('row', newValue);
    }
    
    function addRule(evt) {
        // Add a new rule to the current condition
        evt.preventDefault();
        $.tmpl($('#rule-template'), defaults.rule).insertBefore($(evt.target))  
    }
    
    function deleteRule(evt) {
        // Remove the current rule from the current condition
        evt.preventDefault();
        $(evt.target).closest('.condition-rule').detach();
    }
    
    function preValidate(){
        errors = [];
    }
    
    function findDuplicateHeaders(){
        // Ensure that there are no duplicated row or column headings.
        $table.find('.condition-name').each(function(j, col){
            $this = $(col);
            selector = $table.find('.condition-name[value="' + $this.val() + '"]').not($this).closest('th');
            if (selector.length){
                errors.push({
                    selector:selector,
                    reason: "Duplicate " + defaults.columnName
                });
            }
        });
        
        $table.find('th.row-header').each(function(j,row){
            $this = $(row).find('input:hidden');
            selector = $table.find('th.row-header input:hidden[value="'+ $this.val() + '"]').not($this).closest('th');
            if (selector.length){
                errors.push({
                    selector:selector,
                    reason: "Duplicate " + defaults.rowName
                });
            }
        });
    }
    
    // Load the templates for performance reasons.
    // The default templates will have already been loaded 
    // from json-table-templates.js (also part of the media for the widget)
    // This will override any of these where the correctly named DOM element
    // exists.
    var template_names = [
        'table',
        'row',
        'column-header',
        'column-header-widget',
        'row-header-widget',
        'cell'
    ];
    $.each(template_names, function(i, name){
        if ($('#' + name + '-template').length){
            $.template(name, $('#' + name + '-template'));
        }
    });
    
    // DEBUG($.template('column-header-widget'));
    
    updateDataFromSource();
    
    // DEBUG('Updated Data');
    /*
    Attach all of the event handlers
    */
    
    $('.json-data-table :input').live('change blur', updateSourceFromData);
    $('.json-data-table th .condition-name').live('change blur', updateColumnName);
    $('.json-data-table th.row-header :input').live('change blur', updateRowHeader);
    $('.add-row').live('click', addRow);
    $('.add-column').live('click', addColumn);
    $('.add-rule').live('click', addRule);
    $('.delete-rule').live('click', deleteRule);
    $dataSource.live('change blur', updateDataFromSource);
    
    // $dataSource.hide();
    
    return $;
}


