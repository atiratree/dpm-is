/**
 * Get Property from the DB
 *
 * @param key of the property
 * @param email optional owner of the property
 * @return {boolean} indicating success or failure.
 */
function getProp(key, email) {
  if (!email) {
    email = getUserEmail();
  }

  var rows = repFind_(manager.keyStoreSh, [], {
    email: email,
    key: key
  }, 1);

  if (rows.length == 0){
    return undefined;
  }

  return rows[0].value;
}

/**
 * Store Property in the DB
 *
 * @param key of the property
 * @param value of the property
 * @param email optional owner of the property
 * @return {boolean} indicating success or failure.
 */
function setProp(key, value, email) {
  if (!email) {
    email = getUserEmail();
  }

  var row = {
    email: email,
    key: key,
    value: value
  }

  var success = repUpdate_(manager.keyStoreSh, row, {
    email: email,
    key: key
  }, true);

  if (!success) {
    success = repCreate_(manager.keyStoreSh, row, true);
  }

  return success;
}
