#!/usr/bin/env bash
# Run every suite against a locally served copy of the app.
#
#   ./test/run.sh              runs all suites
#   ./test/run.sh linetest     runs one
#
# There is no build step and there never should be. This script serves the file the
# browser would open, with one substitution: the Google-hosted webfont link is dropped,
# because a sandbox generally cannot reach fonts.googleapis.com and a failed font request
# is not a test result. The Cesium loader is left EXACTLY as shipped so the suites
# exercise the real local-first path.
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVE="${GMAPZ_SERVE_DIR:-${TMPDIR:-/tmp}/gmapz-serve}"
PORT="${GMAPZ_PORT:-8123}"
CHROME="${GMAPZ_CHROME:-/opt/pw-browsers/chromium-1194/chrome-linux/chrome}"
NODE="${GMAPZ_NODE:-/opt/node22/bin/node}"

mkdir -p "$SERVE"
python3 - "$ROOT/gmapz_scout.html" "$SERVE/gmapz_local.html" <<'PY'
import sys
src,out=sys.argv[1],sys.argv[2]
s=open(src,encoding='utf-8').read()
s=s.replace('<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">','')
open(out,'w',encoding='utf-8').write(s)
print('served copy: %s (%d bytes)'%(out,len(s)))
PY

# Cesium: the app looks in ./cesium/ first, which is the path we want under test. Fetch it
# once if it is not already beside the served copy.
if [ ! -f "$SERVE/cesium/Cesium.js" ]; then
  echo "fetching CesiumJS (one time, into $SERVE/cesium)…"
  ( cd "$SERVE" && /opt/node22/bin/npm pack cesium@1.131.0 >/dev/null 2>&1 \
    && tar xzf cesium-1.131.0.tgz && mkdir -p cesium && cp -r package/Build/Cesium/* cesium/ ) \
    || { echo "could not fetch Cesium — suites need it"; exit 2; }
fi

if ! curl -s -o /dev/null --noproxy '*' "http://127.0.0.1:$PORT/gmapz_local.html"; then
  ( cd "$SERVE" && nohup python3 -m http.server "$PORT" >/dev/null 2>&1 & )
  sleep 2
fi
curl -s -o /dev/null -w "server %{http_code} on $PORT\n" --noproxy '*' "http://127.0.0.1:$PORT/gmapz_local.html"

export GMAPZ_URL="http://127.0.0.1:$PORT/gmapz_local.html"
SUITES=("$@")
if [ ${#SUITES[@]} -eq 0 ]; then
  SUITES=()
  for f in "$ROOT"/test/*.mjs; do
    b="$(basename "$f" .mjs)"; [ "$b" = "lib" ] || SUITES+=("$b")
  done
fi

total=0; bad=0
for s in "${SUITES[@]}"; do
  printf '%-14s ' "$s"
  line="$("$NODE" "$ROOT/test/$s.mjs" 2>&1 | tail -1)"
  echo "$line"
  n="$(echo "$line" | grep -oE '^[0-9]+' || echo 0)"
  total=$((total+n))
  echo "$line" | grep -qE '0 failed, 0 page errors' || bad=$((bad+1))
done
echo "-----------------------------------------"
echo "${#SUITES[@]} suites · $total assertions · $bad not green"
exit $(( bad > 0 ))
