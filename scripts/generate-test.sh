#!/usr/bin/env bash

set -e

function visit() {
  pushd "${1}" > /dev/null
}

function leave() {
  popd > /dev/null
}

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
REPO_DIR="$(realpath "${SCRIPT_DIR}/..")"

for DIR_PATH in "${REPO_DIR}/__tests__"/*; do
    DIR_NAME="`basename "${DIR_PATH}"`"
    BUNDLE="${REPO_DIR}/__tests__/${DIR_NAME}/${DIR_NAME}-bundle.js"
    MOCKS_PATH="${REPO_DIR}/__tests__/${DIR_NAME}/mocks.js"

    echo -n > "${BUNDLE}"
    if [[ -f "${MOCKS_PATH}" ]]; then
      cat "${REPO_DIR}/__tests__/${DIR_NAME}/mocks.js" >> "${BUNDLE}"
    fi
    cat "${REPO_DIR}/src/${DIR_NAME}"/*\.js | sed 's/^function/export function/g' >> "${BUNDLE}"
done
