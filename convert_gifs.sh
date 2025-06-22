#!/bin/bash

# Find all .gif files in public/image/classes/ and its subdirectories
find public/image/classes/ -type f -name "*.gif" | while read gif_file; do
  # Construct the output PNG filename by replacing .gif with .png
  png_file="${gif_file%.gif}.png"
  
  echo "Converting $gif_file to $png_file"
  
  # Use ImageMagick's convert command to extract the first frame and save as PNG
  # The [0] extracts the first frame of the GIF
  convert "$gif_file[0]" "$png_file"
  
  if [ $? -eq 0 ]; then
    echo "Successfully converted $gif_file to $png_file"
  else
    echo "Failed to convert $gif_file"
  fi
done
