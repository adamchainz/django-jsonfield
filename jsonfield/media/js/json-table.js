function DEBUG(msg){
    console.log(msg);
}

function jsonTable(dataSource, options){
    // Hang onto the source DOM object.
    var $dataSource = $(dataSource);
    var data = {};
    var $tables;
    var errors = [];
    
    defaults = {
        baseTableNames: [],
        baseRowHeaders: [],
        baseColumnHeaders: [],
        jsonIndent: '    ',
        customValidator: function(data, errors){
            return true;
        },
        defaultRowHeaderValue: "",
        defaultColumnHeaderValue: "",
        display: "inline",
        stripEmptyData: true
    };
    
    $.extend(defaults, options);
    
    function updateDataFromSource(){
        data = JSON.parse($dataSource.val());
        
        // TODO: Better handle this - we need to build up some structure?
        //       Change the sorted order of the JS object?
        
        $.each(defaults.baseTableNames, function(i, el){
            if (!data[el]){
                data[el] = {};
            }
        });
        
        if ($tables) {
            $tables.detach();
        }
        
        if (defaults.display == "inline"){
            $tables = $.tmpl('table', templateData()).appendTo($dataSource.parent());
        } else {
            $tables = $.tmpl('table', templateData()).appendTo('body');
        }
    }
    function getDataFromTable(){
        var newData = {};
        $tables.find('input.cell-value').each(function(i, el){
            $el = $(el);
            // if ($el.val()){
                var table = $el.attr('table');
                var row = $el.attr('row');
                var column = $el.attr('column');
                pathValue(newData, [table, row], column, $el.val());
            // }
        });
        return newData;
    }
    
    function stripEmptyData(){
        $.each(data, function(label, table){
            $.each(table, function(row, rowData){
                $.each(rowData, function(column, value){
                    if (!value){
                        delete rowData[column];
                    }
                });
                if ($.isEmptyObject(rowData)){
                    delete table[row];
                }
            });
            if ($.isEmptyObject(table)){
                delete data[label];
            };
        });
    }
    
    function updateSourceFromData(){
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
        preValidate();
        findDuplicateHeaders();
        defaults.customValidator(data, errors);
        updateErrors();
    }
    
    function updateErrors(){
        $tables.find('tr, td, th').removeClass('errors');
        $tables.find('.errormsg').detach();
        // DEBUG(errors);
        $.each(errors, function(i,el){
            $($(el).selector).addClass("errors");
            $($(el).selector).children().first().before('<div style="color:red;" class="errormsg">' + el.reason + "</div>")
        });
    }
    
    function pathValue(data, keys, last_key, value){
        var curr = data;
        $.each(keys, function(i, val){
            if(!curr[val]){
                curr[val] = {};
            }
            curr = curr[val];
        });
        curr[last_key] = value;
    }
    
    function templateData(){
        var tdata = [];
        $.each(data, function(key, val){
            tdata.push({
                label: key,
                headers: getHeaders(val),
                data: val
            });
        });
        return tdata;
    }
    
    function getHeaders(data){
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
    
    function inAny(value, arrays){
        // is the value in any of the passed in arrays?
        result = false;
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
    
    function headerChanged(kind, sep, innerSep){
        return function(evt){
            var $th = $(this).closest('th');
            var $value = $th.find('input:hidden.heading-value');
            var kind_id = $value.attr(kind + '_id');
            var newValue = combineFields($th.find('.fragment').not(':hidden'), sep, innerSep);
            $th.closest('table').find('input[' + kind + '_id="' + kind_id + '"]').attr(kind, newValue);
            $value.val(newValue);
            updateSourceFromData();
            // DEBUG(newValue);
        };
    }
    var rowHeaderChanged = headerChanged('row', ',', '');
    var columnHeaderChanged = headerChanged('column', ';', ',');
    
    function addRow(evt){
        var $table = $(this).closest('table');
        var label = $table.attr('label');
        $.tmpl('row', {
            row:defaults.defaultRowHeaderValue,
            headers: getHeaders(data[label]),
            data: data,
            label: label,
            row_id: $table.find('tr.data-row').length
        }).insertBefore($(this).closest('tr'));
        // Disable adding a new row until this one has been edited.
        // $(this).attr('disabled','disabled');
        runValidations();
        return false;
    }
    
    function addColumn(evt){
        // Add a new column header.
        var $table = $(this).closest('table');
        var label = $table.attr('label');
        var column = defaults.defaultColumnHeaderValue;
        var column_id = $table.find('tr.header-row th.column-header').length;
        $.tmpl('column-header', {
            column: column,
            column_id: column_id
        }).insertBefore($(this).closest('th'));
        // Now add a cell to each row in this table.
        $table.find('tr.data-row').each(function(i, el){
            $.tmpl('cell', {
                data:{},
                row_id:i,
                row:$(el).find('th input').val(),
                column_id: column_id,
                column: column,
                table: label
            }).appendTo($(el));
        });
        runValidations();
        return false;
    }
    
    function preValidate(){
        errors = [];
    }
    
    function findDuplicateHeaders(data){
        // Ensure that there are no duplicated row or column headings.
        $tables.each(function(i, table){
            $table = $(table);
            $table.find('th.column-header').each(function(j, col){
                $this = $(col).find('input:hidden');
                selector = $table.find('th.column-header input:hidden[value="' + $this.val() + '"]').not($this).closest('th');
                if (selector.length){
                    errors.push({
                        selector:selector,
                        reason: "Duplicate " + defaults.columnName
                    });
                }
                
            });
            $table.find('th.row-header').each(function(j,row){
                $this = $(row).find('input:hidden');
                // DEBUG($this.val());
                selector = $table.find('th.row-header input:hidden[value="'+ $this.val() + '"]').not($this).closest('th');
                if (selector.length){
                    errors.push({
                        selector:selector,
                        reason: "Duplicate " + defaults.rowName
                    });
                }
            });
        });
        
        
    }
    
    // Load the templates for performance reasons.
    function loadTemplates(){
        // TODO: Load the templates here.
        // Perhaps embed the templates, but then override them if there is
        // a DOM element that matches the name?
    }
    $('#table-template').template('table');
    $('#row-template').template('row');
    $('#column-header-template').template('column-header');
    $('#column-header-widget-template').template('column-header-widget');
    $('#row-header-widget-template').template('row-header-widget');
    $('#cell-template').template('cell');
    
    updateDataFromSource();
    
    /*
    Attach all of the event handlers
    */
    
    $('th.column-header :input').live('change blur', columnHeaderChanged);
    $('th.row-header :input').live('change blur', rowHeaderChanged);
    $(':input.cell-value').live('change blur', updateSourceFromData);
    $('.add-row').live('click', addRow);
    $('.add-column').live('click', addColumn);
    $dataSource.live('change blur', updateDataFromSource);
    
    return $;
}


/// TESTING for award rates

function validator(data, errors){
    // DEBUG("Running custom validator");
    $.each(data, function(label, table){
        // More than one under or over per table will conflict.
        $.each({"-1": "under", "1":"over"}, function(val, which){
            // DEBUG(val);
            var clashes = [];
            $.each(table, function(row, rowData){
                // DEBUG(rowData);
                if (row.match(RegExp("^" + val))){
                    clashes.push(row);
                }
            });
            // DEBUG(clashes);
            if (clashes.length > 1){
                // DEBUG(which);
                // DEBUG(clashes);
                $.each(clashes, function(idx, item){
                    errors.push({
                        selector: $('table[label="' + label + '"] th.row-header input:hidden[value="' + item + '"]').closest('th'),
                        reason: "Duplicate " + which + " age directives clash."
                    });
                });
            }
        });
        // Check for overlapping conditions
        
        
        
        // Look for non numeric cell values. +value is allowed.
        $.each(table, function(row, rowData){
            $.each(rowData, function(column, value){
                var _value = $.trim(value);
                if (!_value.match(/^\+?\d*\.?\d*$/)){
                    errors.push({
                        // Would be nice to use [value=value] here, but this does not select properly.
                        selector: $('input.cell-value[table="' + label + '"][row="' + row + '"][column="' + column + '"]').closest('td'),
                        reason: "Invalid format for number or increment."
                    });
                }
            });
        });
    });
}

$(function(){
    // TODO: A better way to handle this. Currently, we are hard-coding
    // the media path.
    $.get('/media/jsonfield/html/table-templates.html', function(data, status, xhr){
        $('body').append(data);
        if (!$('#id_rates').val()){
            $('#id_rates').val('{}');    
        }
        init();
    });
});

function init(){
    jsonTable('#id_rates', {
        baseTableNames: ["non_casual", "casual"],
        baseRowHeaders: ['adult'],
        baseColumnHeaders: ['base', 'public_holiday'],
        rowName: "age rule",
        columnName: "condition",
        defaultColumnHeaderValue: "day;0;00:00;00:00",
        defaultRowHeaderValue: "0,0",
        customValidator: validator,
        display: "popup",
        stripEmptyData: true
    });
}

