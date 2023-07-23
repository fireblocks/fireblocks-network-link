#!/usr/bin/env sh

echo "🧬 Generating the unified spec"
(cd ../api-validator; npm run make-unified-openapi)

echo "\n🧿 Linting"
docker run --rm -it \
  -v "$(pwd)":/tmp stoplight/spectral lint \
  --ruleset "/tmp/fireblocks-openapi-ruleset.yaml" "/tmp/fb-unified-openapi.yaml"
