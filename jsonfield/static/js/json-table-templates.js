$.template('table',
    "<table border='1' class='json-data-table'>                     " +
    "    <tr class='header-row'>                                                         " +
    "        <th>                                                                        " +
    "        </th>                                                                       " +
    "        {{each(i, column) headers.columnHeaders}}                                   " +
    "            {{tmpl({column:column, column_id:i}) 'column-header'}}                  " +
    "        {{/each}}                                                                   " +
    "        <th class='add-column'>                                                     " +
    "            <button>Add {{= settings.columnName }}</button>                         " +
    "        </th>                                                                       " +
    "    </tr>                                                                           " +
    "    {{each(i, row) headers.rowHeaders}}                                             " +
    "        {{tmpl({row:row, headers:headers, data:data, row_id:i}) 'row'}}" +
    "    {{/each}}                                                                       " +
    "    <tr><th><button class='add-row'>Add {{= settings.rowName }}</button></th></tr>  " +
    "</table>                                                                            "
);

$.template('column-header',
    '<th class="column-header">                                                '+
    '    {{tmpl({column:column, column_id:column_id}) "column-header-widget"}} '+
    '</th>                                                                     '
);

$.template('row',
    '<tr class="data-row">                                                                                 '+
    '    <th class="row-header">                                                                           '+
    '        {{tmpl({row:row, row_id:row_id}) "row-header-widget"}}                                        '+
    '    </th>                                                                                             '+
    '    {{each(j, column) headers.columnHeaders}}                                                         '+
    '        {{tmpl({data:data, row:row, column:column, row_id:row_id, column_id:j}) "cell"}} '+
    '    {{/each}}                                                                                         '+
    '</tr>                                                                                                 '
);

$.template('row-header-widget',
    '<input type="text" value="{{= row }}" row_id="{{= row_id }}" class="heading-value">'
);

$.template('column-header-widget',
    '<input type="text" value="{{= column }}" column_id="{{= column_id }}" class="heading-value">'
);

// $.template('cell',
//     '<td class="cell" row="{{= row }}" column="{{= column }}" row_id="{{= row_id }}" column_id="{{= column_id }}">'+
//     '{{each ["rate", "payroll_categories"]}}' +
//     '    {{tmpl(name:$value, type:"text", data:data, row:row, column:column) "cell-input"}}'+
//     '{{/each}}'+
//     '</td>                                                                                      '
// );

$.template('cell-input',
    '<input type="{{= type }}"                                                                  ' +
    '    cell-name="{{= name }}"                                                                ' +
    '    value="{{if data[row] && data[row][column] }}{{= data[row][column][name]}}{{/if}}"     ' +
    '>                                                                                          '
);