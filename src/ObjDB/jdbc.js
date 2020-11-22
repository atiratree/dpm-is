/**
 *  --- objDB ---
 *
 *  Copyright (c) 2012 Harry Oosterveen
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */

/**
 *  @author  Harry Oosterveen <mail@harryonline.net>
 *  @version 20
 *  @since   2012-11-06
 */

/**
 *  Create object and connect to jdbc database
 *
 *  @param {string} url
 *  @param {string} user
 *  @param {string} pass
 */
var jdbc = function(url, user, pass) {
  try {
    this.conn = Jdbc.getConnection(url, user, pass);
  } catch (e) {
    logError_(e);
  }
}

/**
 *  Close the database connection
 */
jdbc.prototype.close = function() {
  if (this.conn != undefined) {
    this.conn.close();
  }
}

/**
 *  Do a simple query without getting results,
 *  useful for modifying, creating and deleting tables
 *  @param {string} query  simple query to be executed
 *  @return {boolean} indicating success or failure.
 */
jdbc.prototype.query = function(query) {
  try {
    var stmt = this.conn.createStatement();
    var ret = stmt.execute(query);
    Logger.log(query);
    stmt.close();
    return ret;
  } catch (e) {
    logError_(e);
    stmt.close();
    return false;
  }
}

/**
 *  Do an update query without getting results,
 *  use for INSERT, DELETE, UPDATE
 *  @param {string} query  simple query to be executed
 *  @return {int} nr. of rows affected?
 */
jdbc.prototype.update = function(query) {
  try {
    var stmt = this.conn.createStatement();
    var ret = stmt.executeUpdate(query);
    Logger.log(query);
    stmt.close();
    return ret;
  } catch (e) {
    logError_(e);
    stmt.close();
    return false;
  }
}

/**
 *  Get result rows from a SELECT query
 *  @param {string} query SELECT query to be executed
 *  @return {array} array of objects, objects have column labels as keys
 */
jdbc.prototype.getRowsByQuery = function(query) {
  try {
    var stmt = this.conn.createStatement();
    var rs = stmt.executeQuery(query);
    Logger.log(query);

    var meta = rs.getMetaData();
    var cols = meta.getColumnCount();
    var info = [];
    for (var i = 1; i <= cols; i++) {
      info[i] = {
        label: meta.getColumnLabel(i),
        type: meta.getColumnTypeName(i)
      }
    }

    var ret = [];
    while (rs.next()) {
      var row = {};
      for (var i = 1; i <= cols; i++) {
        if (rs.getString(i)) {
          switch (info[i].type) {
            case 'INT':
              row[info[i].label] = rs.getInt(i);
              break;
            case 'DATETIME':
            case 'TIMESTAMP':
              var nums = rs.getString(i).match(/\d+/g);
              row[info[i].label] = new Date(nums[0], nums[1] - 1, nums[2], nums[3], nums[4], nums[5]);
              break;
            case 'DATE':
              var nums = rs.getString(i).match(/\d+/g);
              row[info[i].label] = new Date(nums[0], nums[1] - 1, nums[2]);
              break;
            case 'TIME':
              var nums = rs.getString(i).match(/\d+/g);
              row[info[i].label] = new Date(1970, 0, 1, nums[0], nums[1], nums[2]);
              break;
            default:
              row[info[i].label] = rs.getString(i);
              break;
          }
        }
      }
      ret.push(row);
    }
  } catch (e) {
    logError_(e);
  }
  if (rs != undefined) {
    rs.close();
  }
  stmt.close();
  return ret;
}

/**
 *  Get result rows: columns from table where cond
 *  @param {string} table database table
 *  @param {array} columns list of columns, use all columns if no array or empty array
 *  @param {object} cond key/value pairs for selecting rows
 *  @param {int} limit max number of rows returned
 *  @return {array} array of objects, objects have column labels as keys
 */
jdbc.prototype.getRows = function(table, columns, cond, limit) {
  var query = 'SELECT DISTINCT ';
  if (typeof(columns) != 'object' || columns.length == 0) {
    query += '*';
  } else {
    query += columns.toString();
  }
  query += ' from ' + table;
  if (typeof(cond) == 'object') {
    var condString = obj2set_(cond, ' AND ');
    if (condString != '') {
      query += ' WHERE ' + condString;
    }
  }
  if (limit != undefined) {
    query += ' LIMIT ' + limit;
  }
  return this.getRowsByQuery(query);
}

/**
 *  Get key of last insert statement
 *  @return {int}
 */
jdbc.prototype.insertId = function() {
  try {
    var stmt = this.conn.createStatement();
    var rs = stmt.executeQuery('SELECT LAST_INSERT_ID()');
    rs.next();
    ret = rs.getInt(1);
  } catch (e) {
    logError_(e);
  }
  rs.close();
  stmt.close();
  return ret;
}

/**
 *  Insert a row in the database
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs in row that will be inserted
 *  @return {int} nr. of rows affected?
 */
jdbc.prototype.insertRow = function(table, values) {
  var query = 'INSERT INTO ' + table + ' SET ' + obj2set_(values);
  return this.update(query);
}

/**
 *  Update a row in the database
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs that will be set in row
 *  @param {object} cond key/value pairs to identify row(s) to be updated
 *  @return {int} nr. of rows affected?
 */
jdbc.prototype.updateRow = function(table, values, cond) {
  var query = 'UPDATE ' + table + ' SET ' + obj2set_(values);
  if (cond != undefined) {
    query += ' WHERE ' + obj2set_(cond, ' AND ');
  };
  return this.update(query);
}

/**
 *  Replace a row in the database, new row will be inserted if no matching row found
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs in row that will be replaced
 *  @param {object} cond key/value pairs to identify row(s) to be updated
 *  @return {int} nr. of rows affected?
 */
jdbc.prototype.replaceRow = function(table, values, cond) {
  var query = 'REPLACE INTO ' + table + ' SET ' + obj2set_(values) + ', ' + obj2set_(cond);
  return this.update(query);
}

/**
 *  Delete a row in the database
 *  @param {string} table table in which row is set
 *  @param {object} cond key/value pair to identify row(s) to be deleted
 *  @return {int} nr. of rows affected?
 */
jdbc.prototype.deleteRow = function(table, cond) {
  var query = 'DELETE FROM ' + table;
  if (cond != undefined) {
    query += ' WHERE ' + obj2set_(cond, ' AND ');
  };
  return this.update(query);
}

/**
 *  Convert obj to string for SET query part
 *  @private
 *  @parameter {object} obj object to be converted
 *  @parameter {string} sep separator, default = ', '
 *  @return {array} list of key="value" strings, separated by sep
 */
function obj2set_(obj, sep) {
  var setList = [];
  for (var field in obj) {
    if (obj[field] != undefined) {
      if (obj[field].getTime) {
        var tz = new Date().toString().match(/\([^\)]+/)[0].substr(1);
        setList.push('`' + field + '`="' + Utilities.formatDate(obj[field], tz, 'yyyy-MM-dd HH:mm:ss') + '"');
      } else if (typeof obj[field] == 'object' && obj[field].length > 0) {
        setList.push('`' + field + '` IN ' + Utilities.jsonStringify(obj[field]).replace('[', '(').replace(']', ')'));
      } else {
        setList.push('`' + field + '`="' + addslashes_(obj[field].toString()) + '"');
      }
    }
  }
  if (sep == undefined) {
    sep = ', ';
  }
  return setList.join(sep);
}

/**
 *  Prepare string for use in DB query by escaping chracters
 *  @see http://stackoverflow.com/a/11716317
 *  @private
 */
function addslashes_(string) {
  return string.replace(/\\/g, '\\\\').
  replace(/\u0008/g, '\\b').
  replace(/\t/g, '\\t').
  replace(/\n/g, '\\n').
  replace(/\f/g, '\\f').
  replace(/\r/g, '\\r').
  replace(/'/g, '\\\'').
  replace(/"/g, '\\"');
}
