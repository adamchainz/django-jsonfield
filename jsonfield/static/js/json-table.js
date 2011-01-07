var jsonTable = function(dataSource, options){

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
        columnAttributes: {
            rules: {
                days:[],
                start:null, finish:null,
                period:null, length:null
            }
        },
        rowAttributes: {}, // Needed?
        postConstructor: function(){
            
        },
        eventHandlers: []
        
    };
    
    $.extend(defaults, options);
    
    function updateDataFromSource(){
        // Parse whatever data is in the dataSource, and (re)create the
        // table from that value.
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
        // Examine the table, and create the data structure that it
        // represents.
        var newData = {};
        $table.find('td.cell').each(function(i, el){
            $el = $(el);
            var row = $el.attr('row');
            var column = $el.attr('column');
            if (!newData[row]){
                newData[row] = {};
            }
            newData[row][column] = {};
            $el.find('input').each(function(i, inner){
                $inner = $(inner);
                if ($inner.val()){
                    newData[row][column][$inner.attr('cell-name')] = $inner.val();
                }
            });
            if (newData[row][column]) {
                $.extend(newData[row][column], getExtraColumnAttributes(column));
                $.extend(newData[row][column], getExtraRowAttributes(row));
            }
        });
        return newData;
    }
    
    function stripEmptyData(){
        // Remove empty cells, rows and columns from the data.
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
        // Check that the data is valid, and then put that data back
        // into the dataSource object.
        data = getDataFromTable();
        runValidations();
        
        if (defaults.stripEmptyData){
            stripEmptyData();
        }
        if (!errors.length){
            $dataSource.html(JSON.stringify(data, null, defaults.jsonIndent));
        }
    }
    
    function runValidations(){
        preValidate();
        findDuplicateHeaders();
        defaults.customValidator(data, errors);
        updateErrors();
    }
    
    function updateErrors(){
        // TODO: Use templates from html file.
        $table.find('tr, td, th').removeClass('errors');
        $table.parent().find('.errormsg').detach();
        $.each(errors, function(i,el){
            $($(el).selector).addClass("errors");
            $($(el).selector).each(function(){
                // Make sure this error message isn't already here.
                if ($(this).find('div.errormsg').filter(function(){
                    return $(this).html() == el.reason;
                }).length == 0) {
                    $(this)
                        .children()
                        .first()
                        .before('<div style="color:red;" class="errormsg">' + el.reason + "</div>")
                }
            });
        });
        if (errors.length){
            $table.before('<h3 style="color:red;" class="errormsg errors">Errors prevented saving</h3>');
        }
    }
    
    function getColumnAttributes() {
        var attributes = {};
        $.each(data, function(i, row){
            $.each(row, function(name, column){
                if (!attributes[name]){
                    attributes[name] = {};
                }
                $.each(defaults.columnAttributes, function(attr, value){
                    attributes[name][attr] = value;
                });
            });
        });
        return attributes;
    }
    
    function getRowAttributes(){
        var attributes = {};
        $.each(data, function(i, row){
            if (!attributes[row]) {
                attributes[row] = {};
            }
            $.each(row, function(j, column){
                $.each(defaults.columnAttributes, function(attr, value){
                    attributes[row][attr] = value;
                });
            });
        });
        return attributes;
    }
    
    function templateData(){
        var result = {
            headers: getHeaderNames(),
            // FIXME: getConditions() is rates-table-specific
            // conditions: getConditions(),
            column_attributes: getColumnAttributes(),
            row_attributes: getRowAttributes(),
            defaults: defaults,
            data: data
        };
        
        // console.log(result);
        
        return result;
    }
    
    function getHeaderNames(){
        // Gets the names of the headers (from the data structure, not the table.)
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
    
    function getExtraColumnAttributes(columnName) {
        var extras = {};
        $table.find('th.column-header input')
            .filter(function(i){ return $(this).attr('value') == columnName; })
                .closest('th').find('.column-attribute')
                    .each(function(i, form){
                        // Get the name of this attribute.
                        var attr = $(form).attr('attr-name');
                        // console.log(attr);
                        if (!extras[attr]){
                            // If we have not seen this attribute before, add it into the possible extras/jsonExtras
                            extras[attr] = [];
                        }
                        // Convert the fields within it to a JSON object.
                        var value = form2object(form);
                        // console.log(form);
                        // console.log(value);
                        // If we have any select[multiple] elements, that contain a map attribute,
                        // use that attribute as the name of a function to use
                        $(form).find('select').filter(function(i, field){
                            return $(field).attr('multiple') && $(field).attr('map');
                        }).each(function(j, field){
                            var $field = $(field);
                            var name = $field.attr('name');
                            if (value[name].length) {
                                value[name] = $.map(value[name], function(i, el){
                                    return eval($(field).attr('map') + '(' + i + ')');
                                });                                
                            } else {
                                delete value[name];
                            }
                        });
                        if (!$.isEmptyObject(value)){
                            extras[attr].push(value);                            
                        }
                    });
        $.each(extras, function(key, value){
            if (value.length == 0){
                delete extras[key];
            }
        });
        // console.log(extras);
        return extras;    
    }
    
    function getExtraRowAttributes(rowName) {
        var extras = {};
        var jsonExtras = {};
        
        return extras;
    }
    
    function getVisibleHeaders($table) {
        return {
            rowHeaders: $table.find('th.row-header input.heading-value').map(function(i,x){return x.value;}),
            columnHeaders: $table.find('th.column-header input.heading-value').map(function(i,x){return x.value;})
        };
    }
    
    function getRowOrColumns(which){
        var names = getHeaderNames()[which.toLowerCase() + 'Headers'];
        var response = {};
        $.each(names, function(i, name){
            response[name] = eval('getExtra' + which + 'Attributes')(which);
        });
        return response;
    }
    
    function getColumns(){
        return getRowOrColumns('Column');
    }
    
    function getRows(){
        return getRowOrColumns('Row');
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
        runValidations();
    }
    
    function addColumn(evt){
        evt.preventDefault();
        // Add a new column header.
        var column = defaults.defaultColumnHeaderValue;
        var column_id = $table.find('tr.header-row th.column-header').length;
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
        updateSourceFromData();
    }
    
    function updateRowHeader(evt) {
        evt.preventDefault();
        var $th = $(evt.target).closest('th');
        var newValue = combineFields($th.find(':input.fragment'), ',');
        $th.find(':input:hidden').val(newValue);
        $th.closest('tr').find('input.cell-value').attr('row', newValue);
        updateSourceFromData();
    }
    

    
    function preValidate(){
        errors = [];
    }
    
    function findDuplicateHeaders(){
        // Ensure that there are no duplicated row or column headings.
        $table.find('.condition-name').each(function(j, col){
            $this = $(col);
            selector = $table
                .find('.condition-name')
                .filter(function(i){ return $(this).attr('value') == $this.val(); })
                .not($this)
                .closest('th');
            if (selector.length){
                errors.push({
                    selector:selector,
                    reason: "Duplicate " + defaults.columnName
                });
            }
        });
        
        $table.find('th.row-header').each(function(j,row){
            $this = $(row).find('input:hidden');
            selector = $table.find('th.row-header input:hidden').filter(function(i){
                return $(this).attr('value') == $this.val();
            }).not($this).closest('th');
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
    
    /*
    Attach all of the event handlers
    */
    
    $('.json-data-table :input').live('change blur', updateSourceFromData);
    $('.json-data-table th .condition-name').live('change blur', updateColumnName);
    $('.json-data-table th.row-header :input').live('change blur', updateRowHeader);
    $('.add-row').live('click', addRow);
    $('.add-column').live('click', addColumn);
    $dataSource.live('change blur', updateDataFromSource);
    
    // $dataSource.hide();
    }()
    $.each(defaults.eventHandlers, function(i, handler){
        $(handler.selector).live(handler.event, handler.handler());
    });
    
    console.log(arguments.callee.updateSourceFromData);
    
    return $;
};