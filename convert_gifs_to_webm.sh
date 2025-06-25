#!/bin/bash
for f in $(find public/image/classes -name "*.gif"); do
  ffmpeg -i "$f" -c vp9 -b:v 0 -crf 40 "${f%.gif}.webm"
done
