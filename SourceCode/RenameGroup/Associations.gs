function updateGroupClients(oldGroupName, newGroupName) {
  const groupClients = Utils.findGroupClients([], {
    group: oldGroupName
  });

  groupClients.forEach((groupClient) => {
    const update = Object.assign({}, groupClient, { group: newGroupName });
    Utils.updateGroupClient(groupClient, update);
  });
}

function updateGroupLeaders(oldGroupName, newGroupName) {
  const groupLeaders = Utils.findGroupLeaders([], {
    group: oldGroupName
  });

  groupLeaders.forEach((groupLeader) => {
    const update = Object.assign({}, groupLeader, { group: newGroupName });
    Utils.updateGroupLeader(groupLeader, update);
  });
}

function updateGroupActors(oldGroupName, newGroupName) {
  const groupActors = Utils.findGroupActors([], {
    group: oldGroupName
  });

  groupActors.forEach((groupActor) => {
    const update = Object.assign({}, groupActor, { group: newGroupName });
    Utils.updateGroupActor(groupActor, update);
  });
}
