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

  var groups = Utils.sort(Utils.findGroups(), 'group');
  var canEdit = Utils.hasAccessTo(Utils.AccessEnums.GROUP_UPDATE, Utils.PermissionTypes.EDIT);
  var dt = {
    cols:[
      {id:0, label:'Skupina', type: 'string', stringFilter: 'true'},
      {id:1, label:'Počet řádků ve všední den', type: 'number'},
      {id:2, label:'Počet řádků o víkendu', type: 'number'},
      {id:3, label:'' , type: 'string'},
    ],
    rows:[]
  };

  for(var i = 0; i < groups.length; i++) {
    dt.rows.push({
      c:[
        {v: groups[i].group},
        {v: groups[i].weekdayRows},
        {v: groups[i].weekendRows},
        {v: canEdit ? getEditButtonHtml({instance:'group', group: groups[i].group },500,300) : ''},
      ]
    });
  }

  return dt;
}
