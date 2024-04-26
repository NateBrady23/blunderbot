# Usage: python resize-image.py <path_to_image>
# Resize an image to the sizes for Twitch Custom Rewards icons.

import sys
from PIL import Image
import os

def resize_image(input_path, sizes=(112, 56, 28)):
  original_image = Image.open(input_path)
  directory = os.path.dirname(input_path)

  for size in sizes:
    resized_image = original_image.resize((size, size), Image.ANTIALIAS)

    filename, extension = os.path.splitext(os.path.basename(input_path))
    new_filename = f"{size}-{filename}{extension}"
    output_path = os.path.join(directory, new_filename)

    resized_image.save(output_path)
    print(f"Saved resized image to {output_path}")

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python script.py <path_to_image>")
    sys.exit(1)

  image_path = sys.argv[1]
  resize_image(image_path)
