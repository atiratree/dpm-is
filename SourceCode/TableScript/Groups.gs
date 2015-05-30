/**
 * Loads data for Groups Table.
 * Doesn't permit access for assistant.
 *
 * @return dataTable object or empty object
 */
function getGroupsTable() {
  if(!Utils.hasAccessTo(Utils.AccessEnums.GROUP,Utils.PermissionTypes.VIEW)){
    return {};
  }
  
  var groups = Utils.findGroups();
  var canDelete = Utils.hasAccessTo(Utils.AccessEnums.GROUP,Utils.PermissionTypes.EDIT);
  var dt = {
    cols:[
      {id:0, label:'Skupina CategoryFilter', type: 'number', isNumber:true, isDate:false},
      {id:1, label:'' , type: 'string', isNumber:false, isDate:false}   
    ],
    rows:[]
  };
  
  for(var i = 0; i < groups.length; i++) {   
      dt.rows.push({
        c:[
          {v: groups[i].group},
          {v: canDelete ? getDeleteButtonHtml({instance: 'group',name:groups[i].group},500,150) : ''}
        ]
      });    
  }
  
  return dt;
}