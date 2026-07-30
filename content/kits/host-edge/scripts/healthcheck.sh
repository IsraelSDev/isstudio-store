#!/usr/bin/env sh
# Healthcheck HTTP — usado pelo monitor do Edge Hosting.
set -eu
URL="${1:-http://127.0.0.1:3000/}"
CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$URL" || echo "000")
if [ "$CODE" -ge 200 ] && [ "$CODE" -lt 500 ]; then
  echo "ok $CODE"
  exit 0
fi
echo "fail $CODE"
exit 1
