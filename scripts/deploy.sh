#!/usr/bin/env bash

set -e

function visit() {
  pushd "${1}" > /dev/null
}

function leave() {
  popd > /dev/null
}


FORCE=${FORCE:-false}

SCRIPT_DIR="$(dirname "$(readlink -f "$0")")"
REPO_DIR="$(realpath "${SCRIPT_DIR}/..")"

# Order of dependencies important!
DEPENDENCY_NAMES=(ObjDB Utils)

declare -A DEPENDENCIES

visit "${REPO_DIR}/src"
  # Order of dependencies important!
  for PROJECT in ${DEPENDENCY_NAMES[*]} $(ls | grep -vE "$(echo ${DEPENDENCY_NAMES[@]} | sed "s/ /|/")"); do
    visit "${PROJECT}"
      if [ -f ".clasp.json" ] && [ -f "appsscript.json" ]; then
        echo "processing ${PROJECT}"
        if [  "$(jq -r ".dependencies.libraries" appsscript.json)" != "null" ]; then
          NEXT_DEP_IDX=0
          for DEP_ID in $(jq -r ".dependencies.libraries[].libraryId" appsscript.json); do
            DEP_VERSION="${DEPENDENCIES["${DEP_ID}"]}"
            if [ -n "${DEP_VERSION}" ]; then
              jq -r ".dependencies.libraries[${NEXT_DEP_IDX}].version = ${DEP_VERSION}" appsscript.json > appsscript.json.tmp
              mv appsscript.json.tmp appsscript.json
            fi
            NEXT_DEP_ID=$((NEXT_DEP_IDX + 1))
          done
        fi
        if ! git diff --quiet HEAD  -- .; then
          if [ "${FORCE}" == 'true' ] || ! git diff --quiet  -- .; then
            git add .
            gclasp push -f
            gclasp deploy || true # has non fatal errors
          fi
        fi
        # set new version to dependencies
        DEP_ID="$(jq -r ".scriptId" .clasp.json)"
        DEP_VERSION="$(gclasp versions | grep -oE "^[0-9]+" | head -1)"
        DEPENDENCIES["${DEP_ID}"]="${DEP_VERSION}"
      fi
    leave
  done

leave