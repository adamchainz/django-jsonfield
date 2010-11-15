function DEBUG(msg){
    console.log(msg);
}

function jsonTable(dataSource, options){
    // Hang onto the source DOM object.
    var $dataSource = $(dataSource);
    var data = {};
    var $tables;
    var errors = [];
    
    var defaults = {
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
    
    // DEBUG(defaults);
    
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
        $tables.find('tr, td, th').removeClass('errors');
        $tables.parent().find('.errormsg').detach();
        // DEBUG(errors);
        $.each(errors, function(i,el){
            $($(el).selector).addClass("errors");
            $($(el).selector).children().first().before('<div style="color:red;" class="errormsg">' + el.reason + "</div>")
        });
        if (errors.length){
            $tables.first().before('<h3 style="color:red;" class="errormsg errors">Errors prevented saving</h3>');
        }
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
                data: val,
                defaults: defaults
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
    
    function getVisibleHeaders($table) {
        return {
            rowHeaders: $table.find('th.row-header input.heading-value').map(function(i,x){return x.value}),
            columnHeaders: $table.find('th.column-header input.heading-value').map(function(i,x){return x.value})            
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
            headers: getVisibleHeaders($table),
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
                row:$(el).find('th input.heading-value').val(),
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
                $this = $(col).find('input:hidden.heading-value');
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
    
    $('th.column-header :input').live('change blur', columnHeaderChanged);
    $('th.row-header :input').live('change blur', rowHeaderChanged);
    $(':input.cell-value').live('change blur', updateSourceFromData);
    $('.add-row').live('click', addRow);
    $('.add-column').live('click', addColumn);
    $dataSource.live('change blur', updateDataFromSource);
    
    $dataSource.hide();
    
    return $;
}


