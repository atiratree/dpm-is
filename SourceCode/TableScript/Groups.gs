/**
 * Loads data for Groups Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getGroupsTable() {
  if (!Utils.hasAccessTo(Utils.AccessEnums.GROUP,Utils.PermissionTypes.VIEW)) {
    return {};
  }

  var groups = Utils.sort(Utils.findGroupsAsArray());
  var canDelete = Utils.hasAccessTo(Utils.AccessEnums.GROUP,Utils.PermissionTypes.EDIT);
  var dt = {
    cols:[
      {id:0, label:'Skupina', type: 'string', stringFilter: 'true'},
      {id:1, label:'' , type: 'string'}
    ],
    rows:[]
  };

  for(var i = 0; i < groups.length; i++) {
    dt.rows.push({
      c:[
        {v: groups[i]},
        {v: canDelete ? getDeleteButtonHtml({instance: 'group',name:groups[i]},500,150) : ''}
      ]
    });
  }

  return dt;
}