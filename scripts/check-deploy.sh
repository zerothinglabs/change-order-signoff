#!/bin/sh
set -eu

base="${1:?usage: check-deploy.sh <product base url>}"
reply=$(curl -sS -m 20 --retry 3 -w '\n%{http_code}' -X POST \
  -H 'content-type: application/json' \
  -H 'cookie: zt_internal=1' \
  -H 'x-zt-vid: zt-deploy-check' \
  --data '{}' "${base%/}/api/workspace")
status=$(printf '%s\n' "$reply" | tail -n 1)

if [ "$status" != 201 ] || ! printf '%s\n' "$reply" | grep -q '"owner_token":"[A-Za-z0-9_-]\{43\}"'; then
  echo "POST /api/workspace returned $status without an owner_token, want 201 with one" >&2
  exit 1
fi

echo "POST /api/workspace 201 with owner_token"
