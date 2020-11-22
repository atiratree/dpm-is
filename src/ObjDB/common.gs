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
 * Changes
 * 1.0 Initial version
 * 1.1 Added replaceRow (2012-12-15)
 * 20  Version numbering as in Script version, fixed caching bug after data manipulation in spreadsheets (2012-12-19)
 */

/**
 *  Open database or spreadsheet
 *  @param {string} dbString  jdbc connection string or unique identifier for spreadsheet
 *  @param {string} user (jdbc only)
 *  @param {string} pass  (jdbc only)
 *  @return {object} handler for further operations
 */
function open(dbString, user, pass) {
  if (dbString.match(/^jdbc:/)) {
    return new jdbc(dbString, user, pass);
  } else {
    return new ss(dbString);
  }
}

/**
 *  Set the rows to skip in sheets (spreadsheets only)
 *  so first row contains headers and second and below data
 *  similar to JS array splice function
 *  @param {object} handler
 *  @param {string} table name of sheet
 *  @param {int} index number of first row to skip, as in right margin in spreadsheet view
 *  @param {int} howMany number of rows to remove
 */
function setSkipRows(handler, table, index, howMany) {
  return handler.setSkipRows(table, index, howMany);
}

/**
 *  Close the database connection (jdbc only)
 *  @param {object} handler
 */
function close(handler) {
  handler.close();
}

/**
 *  Do a simple query without getting results, (jdbc only)
 *  useful for modifying, creating and deleting tables
 *  @param {object} handler
 *  @param {string} query  simple query to be executed
 *  @return {boolean} indicating success or failure.
 */
function query(handler, query) {
  return handler.query(query);
}

/**
 *  Do an update query without getting results, (jdbc only)
 *  use for INSERT, DELETE, UPDATE
 *  @param {object} handler
 *  @param {string} query  simple query to be executed
 *  @return {int} nr. of rows affected?
 */
function update(handler, query) {
  return handler.update(query);
}

/**
 *  Get result rows from a SELECT query (jdbc only)
 *  @param {object} handler
 *  @param {string} query SELECT query to be executed
 *  @return {array} array of objects, objects have column labels as keys
 */
function getRowsByQuery(handler, query) {
  return handler.getRowsByQuery(query);
}

/**
 *  Get result rows: columns from table where cond
 *  @param {object} handler
 *  @param {string} table database table
 *  @param {array} columns list of columns, use all columns if no array or empty array
 *  @param {object} cond key/value pairs for selecting rows
 *  @param {int} limit max number of rows returned
 *  @return {array} array of objects, objects have column labels as keys
 */
function getRows(handler, table, columns, cond, limit) {
  return handler.getRows(table, columns, cond, limit);
}

/**
 *  Get key of last insert statement (jdbc only)
 *  @param {object} handler
 *  @return {int}
 */
function insertId(handler) {
  return handler.insertId();
}

/**
 *  Insert a row in the database
 *  @param {object} handler
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs in row that will be inserted
 *  @return {int} nr. of rows affected?
 */
function insertRow(handler, table, values) {
  return handler.insertRow(table, values);
}

/**
 *  Update a row in the database
 *  @param {object} handler
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs that will be set in row
 *  @param {object} cond key/value pair to identify row(s) to be updated
 *  @return {int} nr. of rows affected?
 */
function updateRow(handler, table, values, cond) {
  return handler.updateRow(table, values, cond);
}

/**
 *  Replace a row in the database--insert if the row does not exist yet
 *  @param {object} handler
 *  @param {string} table table in which row is set
 *  @param {object} values key/value pairs that will be set in row
 *  @param {object} cond key/value pair to identify row(s) to be updated
 *  @return {int} nr. of rows affected?
 */
function replaceRow(handler, table, values, cond) {
  return handler.replaceRow(table, values, cond);
}

/**
 *  Delete a row from the database
 *  @param {object} handler
 *  @param {string} table table in which row is set
 *  @param {object} cond key/value pair to identify row(s) to be deleted
 *  @return {int} nr. of rows affected?
 */
function deleteRow(handler, table, cond) {
  return handler.deleteRow(table, cond);
}

/**
 *  Write error information to logger
 *  @private
 *  @param {object} e error object
 */

function logError_(e) {
  logException_(e);
  //Logger.log( '%s in line %s: %s', e.name, e.lineNumber, e.message );
  //Logger.log( e.stack.match( /\([^\)]*\)/g ).reverse().join(' > ').replace( /[\(\)]/g, ''));
}
