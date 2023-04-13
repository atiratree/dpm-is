function doRename() {
  try {
    renameGroupAndAssociations("Tým NB", "Tým CHB");
  } catch(x) {
    Utils.logError(x);
    console.log(x);
  }
}

function renameGroupAndAssociations(oldGroupName, newGroupName) {
  Utils.log(`renaming ${oldGroupName} group to ${newGroupName}`);

  // get group
  const groupObjs = Utils.findGroups([], {
    group: oldGroupName
  });

  if (groupObjs.length != 1) {
    Utils.logError(`invalid number of groups ${oldGroupName}: ${JSON.stringify(groupObjs)}`);
    return;
  }

  // update group
  const groupObj = groupObjs[0];
  groupObj.group = newGroupName;
  if (!Utils.updateGroup(groupObj, oldGroupName)) {
    Utils.logError(`failed to update: ${JSON.stringify(groupObj)}`);
    return;
  }

  // update associations
  updateGroupClients(oldGroupName, newGroupName);
  updateGroupLeaders(oldGroupName, newGroupName);
  updateGroupActors(oldGroupName, newGroupName);

  // rename files and their headers
  renameFiles(oldGroupName, newGroupName);
}
