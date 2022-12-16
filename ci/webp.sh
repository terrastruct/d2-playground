#!/bin/bash

set -eu

for img in src/assets/images/*.png; do
  cwebp -q 80 ${img} -o ${img%.*}.webp
done
