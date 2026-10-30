#!/bin/sh
set -eu

base="${1:?usage: check-deploy.sh <product base url>}"
status=$(curl -s -o /dev/null -w '%{http_code}' -X POST \
  -H 'content-type: application/json' \
  -H 'cookie: zt_internal=1' \
  -H 'x-zt-vid: zt-deploy-check' \
  --data '{}' "${base%/}/api/workspace")

if [ "$status" != 201 ]; then
  echo "POST /api/workspace returned $status, want 201" >&2
  exit 1
fi

echo "POST /api/workspace 201"
