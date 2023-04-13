#!/usr/bin/env bash

set -e

# run as ../../scripts/prune-deployments.sh in each src/* project directory
#
# tail -n +2 # skip Deployments header
# grep -v "@HEAD" # HEAD deployment cannot be deleted
# grep -v "meta-version" # skip web app as it is referenced in the UI
# cut -d' ' -f2 # pick deployment ID
for deployment in $(gclasp deployments |  tail -n +2 | grep -v "@HEAD" | grep -v "web app" | cut -d' ' -f2); do
  gclasp undeploy "${deployment}"
done
