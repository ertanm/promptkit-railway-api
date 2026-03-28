#!/bin/bash
set -e

BUILD_DIR="build/chrome-mv3-prod"
OUTPUT="injectkit-extension.zip"

if [ ! -d "$BUILD_DIR" ]; then
  echo "ERROR: $BUILD_DIR does not exist. Run yarn build:prod first."
  exit 1
fi

# Safety check: confirm no .env files crept into the build dir
if find "$BUILD_DIR" \( -name ".env" -o -name "*.env" \) 2>/dev/null | grep -q .; then
  echo "ERROR: .env file found in build directory. Aborting."
  exit 1
fi

rm -f "$OUTPUT"
cd "$BUILD_DIR"
zip -r "../../$OUTPUT" .
cd ../..

echo "Created $OUTPUT from $BUILD_DIR only."
echo "Safe to upload to Chrome Web Store."
