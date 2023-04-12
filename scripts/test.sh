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

visit "${REPO_DIR}"
    yarn test
leave
