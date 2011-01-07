(function($){
    $.fn.jsonTable = function(options) {
        var settings = {
            baseRowHeaders: [],
            defaultRowHeaderValue: "",
            rowAttributes: {},
            
            baseColumnHeaders: [],
            defaultColumnHeaderValue: "",
            columnAttributes: {},
            
            jsonIndent: "    ",
            display: "inline",
            stripEmptyData: true,
            
            eventHandlers: [],
            
            customValidator: function(data, errors) {
                return true;
            },
            
            methods: {}
            
        };
                        
        return this.each(function(){
            var $this = $(this);
            var data = {};
            var $table;
            var errors = [];
            
            // What stuff was passed in by user?
            if (options) {
                $.extend(settings, options);
            }
            
            /*
             * Functions for updating the table from the data source.
             *
             */
            var updateTableFromSource = function() {
                // Parse the data from the data source, and (re)create the
                // table from that value.
                data = JSON.parse($this.val());
                if ($table) {
                    $table.detach();
                }
                
                var target = "body";
                if (settings.display == "inline") {
                    target = $this.parent();
                }
                $table = $.tmpl('table', templateData()).appendTo(target);
            };
            
            var templateData = function() {
                // Convert the data into a format that can be handled
                // by the templating engine.
                var result = {
                    headers: getHeaderNamesFromData(),
                    settings: settings,
                    data: data
                };
                $.extend(result, getAttributesFromData());
                // console.log(result);
                return result;
            };
            
            var getHeaderNamesFromData = function() {
                var rowHeaders = [], columnHeaders = [];
                $.each(data, function(row, rowData){
                    if (!inAny(row, [rowHeaders, settings.baseRowHeaders])){
                        rowHeaders.push(row);
                    }
                    $.each(rowData, function(column, cell){
                        if (!inAny(column, [columnHeaders, settings.baseColumnHeaders])){
                            columnHeaders.push(column);
                        }
                    });
                });
                return {
                    rowHeaders: $.merge(settings.baseRowHeaders.slice(), rowHeaders.sort().reverse().slice()),
                    columnHeaders: $.merge(settings.baseColumnHeaders.slice(), columnHeaders.sort().reverse().slice())
                };
            };
            
            var getAttributesFromData = function() {
                // We want to get all of the row/column attributes from
                // the stored data.
                var attributes = {
                    column_attributes: {},
                    row_attributes: {}
                };
                
                // We need to look at each cell, but are confident that
                // the row/column attributes are the same for each cell
                // in a row/column.
                $.each(data, function(rowName, row){
                    if (!attributes.row_attributes[rowName]) {
                        attributes.row_attributes[rowName] = {};
                    }
                    $.each(row, function(colName, cell){
                        if (!attributes.column_attributes[colName]) {
                            attributes.column_attributes[colName] = {};
                        }
                        $.each(settings.columnAttributes, function(attr, value){
                            attributes.column_attributes[colName][attr] = cell[attr] || [];
                            // $.extend(attributes.column_attributes[colName][attr], cell[attr]);
                        });
                        $.each(settings.rowAttributes, function(attr, value){
                            attributes.row_attributes[rowName][attr] = cell[attr] || [];
                            // $.extend(attributes.row_attributes[rowName][attr], cell[attr]);
                        });
                    });
                });
                return attributes;
            };
            
            
            /*
                Function for manipulating the data.
                
            */
            
            var stripEmptyData = function(){
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
            };
            
            /*
                
              Functions for updating the data source from the table.
            
             */
             
            var getDataFromTable = function() {
                // Parse the table object, and get the data housed within.
                var newData = {};
                $table.find('td.cell').each(function(i, cell){
                    $cell = $(cell);
                    var row = $cell.attr('row');
                    var column = $cell.attr('column');
                    if (!newData[row]){
                        newData[row] = {};
                    }
                    newData[row][column] = {};
                    $cell.find('input').each(function(j, input){
                        var $input = $(input);
                        if ($input.val()){
                            newData[row][column][$input.attr('cell-name')] = $input.val();
                        }
                    });
                    if ($.isEmptyObject(newData[row][column])) {
                        delete newData[row][column];
                        if ($.isEmptyObject(newData[row])){
                            delete newData[row];
                        }
                    } else {
                        $.extend(newData[row][column], getExtraColumnAttributes(column));
                        // $.extend(newData[row][column], getExtraRowAttributes(row));
                    }
                });
                
                return newData;
            };
            
            var getHeaderNamesFromTable = function() {
                return {
                    rowHeaders: $table.find('th.row-header input.heading-value').map(function(i,x){return x.value;}),
                    columnHeaders: $table.find('th.column-header input.heading-value').map(function(i,x){return x.value;})
                };
            };
            
            var getExtraColumnAttributes = function(columnName) {
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
            };
            
            var updateSourceFromTable = function() {
                // We want to put the data into variable from prev scope.
                data = getDataFromTable();
                // console.log(data);
                runValidations();
                
                if (settings.stripEmptyData){
                    stripEmptyData();
                }
                
                if (!errors.length) {
                    // console.log($this);
                    $this.html(JSON.stringify(data, null, settings.jsonIndent));
                }
            };
            
            
            // Validation and error display code.
            
            var runValidations = function() {
                errors = [];
                findDuplicateHeaders();
                settings.customValidator(data, errors);
                updateErrors();
            };
            
            var findDuplicateHeaders = function() {
                // Ensure that there are no duplicated row or column headings.
                $table.find('.condition-name').each(function(j, col){
                    var $col = $(col);
                    selector = $table
                        .find('.condition-name')
                        .filter(function(i){ return $(this).attr('value') == $col.val(); })
                        .not($col)
                        .closest('th');
                    if (selector.length){
                        errors.push({
                            selector:selector,
                            reason: "Duplicate " + settings.columnName
                        });
                    }
                });

                $table.find('th.row-header').each(function(j,row){
                    var $row = $(row).find('input:hidden');
                    selector = $table.find('th.row-header input:hidden').filter(function(i){
                        return $(this).attr('value') == $row.val();
                    }).not($row).closest('th');
                    if (selector.length){
                        errors.push({
                            selector:selector,
                            reason: "Duplicate " + settings.rowName
                        });
                    }
                });
            };
            
            var updateErrors = function() {
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
                                .before('<div style="color:red;" class="errormsg">' + el.reason + "</div>");
                        }
                    });
                });
                if (errors.length){
                    $table.before('<h3 style="color:red;" class="errormsg errors">Errors prevented saving</h3>');
                }
                
            };
            
            // Helper functions
            
            var inAny = function(value, arrays) {
                var result = false;
                $.each(arrays, function(i, val){
                    if ($.inArray(value, val) > -1) {
                        result = true;
                        // This return only returns from the inner function
                        // to each, not inAny.
                        return false;
                    }
                });
                return result;
            };
            
            var combineFields = function($fields, sep, innerSep){
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
            };
            
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
            
            $.extend(settings.methods, {
                updateSourceFromTable: updateSourceFromTable
            });
            
            updateTableFromSource();
            
            
            var eventHandlers = [
                {
                    name: "addRow",
                    method: function(evt){
                        evt.preventDefault();
                        // console.log("Adding Row...");
                        $.tmpl('row', {
                            row: settings.defaultRowHeaderValue,
                            headers: getHeaderNamesFromTable(),
                            data: data,
                            row_id: $table.find('tr.data-row').length
                        }).insertBefore($(this).closest('tr'));
                        runValidations();
                    },
                    selector: ".add-row",
                    events: 'click'
                },
                {
                    name: "addColumn",
                    method: function(evt) {
                        evt.preventDefault();
                        // console.log("Adding Column...");
                        var column = settings.defaultColumnHeaderValue;
                        var column_id = $table.find('tr.header-row th.column-header').length;
                        var tmplData = {
                            column: column,
                            column_id: column_id
                        };
                        $.extend(tmplData, settings.columnAttributes);
                        
                        $.tmpl('column-header', tmplData).insertBefore($(this).closest('th'));
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
                    },
                    selector: ".add-column",
                    events: "click"
                },
                {
                    name: "updateTable",
                    selector: "td input",
                    events: 'blur change',
                    method: updateSourceFromTable
                },
                {
                    name: "updateColumnHeader",
                    selector: ".json-data-table th.column-header :input",
                    events: "change blur",
                    method: function(evt) {
                        evt.preventDefault();
                        var $target = $(evt.target);
                        var newName = $target.val();
                        var column_id = $target.attr('column_id');
                        $table.find('td.cell').filter(function(i){
                            return $(this).attr('column_id') == column_id;
                        }).attr('column', newName);
                        updateSourceFromTable();
                    }
                },
                {
                    name: "updateRowHeader",
                    selector: ".json-data-table th.row-header :input",
                    events: "change blur",
                    method: function(evt) {
                        evt.preventDefault();
                        var $th = $(evt.target).closest('th');
                        var newValue = combineFields($th.find(':input.fragment'), ',');
                        // console.log(newValue);
                        $th.find(':input:hidden').val(newValue);
                        $th.closest('tr').find('td.cell').attr('row', newValue);
                        updateSourceFromTable();
                    }
                }
            ];
            
            $.each(eventHandlers, function(i, handler){
                $(handler.selector).live(handler.events, handler.method);
            });
            $.each(settings.eventHandlers, function(i, handler){
                $(handler.selector).live(handler.events, handler.method(settings));
            });
            
            $this.hide();
            
        });
    };
})(jQuery);