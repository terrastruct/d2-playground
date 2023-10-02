#!/bin/bash

help() {
  cat <<EOF
usage: $0
Run to deploy a new https://play.d2lang.com.
Builds the JS with ESBuild, deploys by syncing to S3 bucket, and invalidates
the Cloudfront cache.
EOF
}

set -eu
. "$(dirname "$0")/../ci/sub/lib.sh"

if [ -z ${PLAYGROUND_CLOUDFRONT_ID} ]; then
  echo "missing env var PLAYGROUND_CLOUDFRONT_ID"
  exit 1
fi

if [ -z ${PLAYGROUND_S3_BUCKET} ]; then
  echo "missing env var PLAYGROUND_S3_BUCKET"
  exit 1
fi

# TODO copy snippets
copyfiles=(
  "src/assets/favicon.ico"
  "src/js/vendor"
  "src/fonts"
  "src/assets"
)

# TODO look into removing unused CSS
# https://purgecss.com/CLI.html
build() {
  mkdir -p dist

  esbuild src/js/main.js --bundle --minify --define:ENV=\"PRODUCTION\" --loader:.js=jsx --loader:.ttf=base64 --outfile=dist/build/out.js
  esbuild src/css/main.css --bundle --minify --loader:.svg=base64 --loader:.ttf=base64 --outfile=dist/build/style.css
  # https://github.com/tdewolff/minify/tree/master/cmd/minify
  minify -o dist/index.html src/index.html

  for f in ${copyfiles[@]}; do
    echo "copying ${f}"
    cp -R ${f} dist
  done

  mkdir -p dist/js
  cp -R "src/js/vendor" dist/js
  for js in dist/js/vendor/*.js; do
    esbuild ${js} --minify --outfile=${js} --allow-overwrite
  done
  cp -R "src/js/snippets" dist/js
  for js in dist/js/snippets/*.js; do
    esbuild ${js} --minify --outfile=${js} --allow-overwrite
  done
}

main() {
  hide aws sts get-caller-identity

  bigheader "Building"

  build

  bigheader "Deploying"

  runjob 'aws s3 sync' "aws s3 sync ./dist ${PLAYGROUND_S3_BUCKET} --delete --no-progress"

  # TODO should run the compression concurrent alongside build and deploy above
  # Cloudfront does not support wasm compression, so we upload it compressed
  bigheader "WASM"

  # TODO only run wasm if differs from dist. slow.

  brotli -c src/js/vendor/onig.wasm > dist/js/vendor/onig.wasm
  brotli -c src/d2.64453f1.wasm > dist/d2.64453f1.wasm
  aws s3 cp dist/d2.64453f1.wasm ${PLAYGROUND_S3_BUCKET} --content-encoding br --content-type application/wasm

  bigheader "Invalidating cache"

  hide aws cloudfront create-invalidation --distribution-id ${PLAYGROUND_CLOUDFRONT_ID} --paths "/*"
}

main
