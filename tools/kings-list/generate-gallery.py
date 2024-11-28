import os
import sys

def generate_html(directory):
  # Get the directory name for the output HTML file
  dir_name = os.path.basename(os.path.normpath(directory))
  html_file_name = f"{dir_name}.html"

  # Start the HTML content
  html_content = f"""
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{dir_name} Gallery</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
            }}
            .gallery {{
                display: flex;
                flex-wrap: wrap;
            }}
            .gallery img {{
                margin: 10px;
                border: 1px solid #ccc;
                width: 200px;
                height: auto;
                transition: transform 0.2s;
            }}
            .gallery img:hover {{
                transform: scale(1.1);
            }}
            .image-container {{
                position: relative;
                display: inline-block;
            }}
            .image-container .tooltip {{
                visibility: hidden;
                background-color: black;
                color: #fff;
                text-align: center;
                border-radius: 5px;
                padding: 5px;
                position: absolute;
                z-index: 1;
                bottom: 100%; /* Position the tooltip above the image */
                left: 50%;
                margin-left: -50px;
                width: 100px;
            }}
            .image-container:hover .tooltip {{
                visibility: visible;
            }}
        </style>
    </head>
    <body>
        <h1>{dir_name} Gallery</h1>
        <div class="gallery">
    """

  # Add images to the HTML content
  for filename in os.listdir(directory):
    if (filename.endswith(".png") or filename.endswith(".gif")) and not filename.startswith("secret_"):
      image_name = os.path.splitext(filename)[0]
      html_content += f"""
            <div class="image-container">
                <img src="{filename}" alt="{image_name}">
                <div class="tooltip">{image_name}</div>
            </div>
            """

  # End the HTML content
  html_content += """
        </div>
    </body>
    </html>
    """

  # Write the HTML content to a file
  with open(html_file_name, 'w') as html_file:
    html_file.write(html_content)

  print(f"Gallery created successfully: {html_file_name}")

if __name__ == "__main__":
  if len(sys.argv) != 2:
    print("Usage: python script.py <directory_path>")
    sys.exit(1)

  directory_path = sys.argv[1]

  if not os.path.isdir(directory_path):
    print(f"Error: {directory_path} is not a valid directory.")
    sys.exit(1)

  generate_html(directory_path)
