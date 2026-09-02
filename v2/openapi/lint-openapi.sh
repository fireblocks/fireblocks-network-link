#!/usr/bin/env sh

docker info 1>/dev/null || { echo '\n❌ ERROR: Docker is not running!'; exit 1; }

echo "🧬 Generating the unified spec"
(cd ../api-validator; npm run make-unified-openapi)

echo "\n🧿 Linting"
# Using Spectral OpenAPI linter with custom ruleset
# Documentation: https://docs.stoplight.io/docs/spectral/674b27b261c3c-overview
docker run --rm -it \
  -v "$(pwd)":/tmp stoplight/spectral lint \
  --fail-severity=warn \
  --ruleset "/tmp/fireblocks-openapi-ruleset.yaml" "/tmp/fb-unified-openapi.yaml" \
|| { echo '\n❌ ERROR: Linter failed!'; exit 1; }

echo "\n💌 Wiring external documentation"
sed -i '' 's/Placeholder for automatic documentation injection from README.md/\n    $ref: README.md/g' fb-unified-openapi.yaml
