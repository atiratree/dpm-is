const ObjDB = {
  open: (id) => {
    if (id === getUtilsProp_('DatabaseSSid')) {
      return {}
    }
    throw "not implemented";
  }
}

const DriveApp = {
  getFolderById: (id) => {
    if (id === getUtilsProp_('DatabaseSSid')) {
      return {
        getOwner: () => ({
          getEmail: () => "main@email.com",
        })
      }
    }
    throw "not implemented";
  }
}

export const SpreadsheetApp = {
  DataValidationCriteria: {
    VALUE_IN_LIST: 'VALUE_IN_LIST',
  }
}
