$.template('table',
    "<table border='1' label='{{= label }}' class='json-data-table'>                     " +
    "    <tr class='header-row'>                                                         " +
    "        <th>                                                                        " +
    "            {{= label }}                                                            " +
    "        </th>                                                                       " +
    "        {{each(i, column) headers.columnHeaders}}                                   " +
    "            {{tmpl({column:column, column_id:i}) 'column-header'}}                  " +
    "        {{/each}}                                                                   " +
    "        <th class='add-column'>                                                     " +
    "            <button>Add {{= defaults.columnName }}</button>                         " +
    "        </th>                                                                       " +
    "    </tr>                                                                           " +
    "    {{each(i, row) headers.rowHeaders}}                                             " +
    "        {{tmpl({row:row, headers:headers, data:data, label:label, row_id:i}) 'row'}}" +
    "    {{/each}}                                                                       " +
    "    <tr><th><button class='add-row'>Add {{= defaults.rowName }}</button></th></tr>  " +
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
    '        {{tmpl({data:data, row:row, column:column, table:label, row_id:row_id, column_id:j}) "cell"}} '+
    '    {{/each}}                                                                                         '+
    '</tr>                                                                                                 '
);

$.template('row-header-widget',
    '<input type="text" value="{{= row }}" row_id="{{= row_id }}" class="heading-value">'
);

$.template('column-header-widget',
    '<input type="text" value="{{= column }}" column_id="{{= column_id }}" class="heading-value">'
);

$.template('cell',
    '<td>                                                                                       '+
    '<input                                                                                     '+
    '    type="text" value="{{if data[row]}}{{= data[row][column] }}{{/if}}" class="cell-value" '+
    '    row="{{= row }}" column="{{= column }}" table="{{= table }}"                           '+
    '    row_id="{{= row_id }}" column_id="{{= column_id }}"                                    '+
    '>                                                                                          '+
    '</td>                                                                                      '
);