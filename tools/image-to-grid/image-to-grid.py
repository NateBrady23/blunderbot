from PIL import Image
import numpy as np
import sys

def get_grid_colors(image_path):
  img = Image.open(image_path)
  img = img.convert('RGBA')
  width, height = img.size

  cell_width = width // 8
  cell_height = height // 8

  img_array = np.array(img)

  colors = {}

  for row in range(8):
    for col in range(8):
      center_x = col * cell_width + cell_width // 2
      center_y = row * cell_height + cell_height // 2

      color = img_array[center_y, center_x]

      # Convert to 'rgba(R, G, B, A)' format
      color_str = f'rgba({color[0]}, {color[1]}, {color[2]}, 0.5)'

      grid_label = f"{chr(97 + col)}{8 - row}"
      colors[grid_label] = color_str

  # Format as a typescript object
  result = "{\n"
  for key in sorted(colors.keys()):
    result += f"  {key}: '{colors[key]}',\n"
  result = result.rstrip(",\n") + "\n}"
  return result

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python script.py <image_path>")
    sys.exit(1)

  image_path = sys.argv[1]
  color_grid = get_grid_colors(image_path)
  print(color_grid)
