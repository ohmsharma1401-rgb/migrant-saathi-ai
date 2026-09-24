import os
from PIL import Image, ImageOps
import numpy as np

src_path = r"C:\Users\ohm\.gemini\antigravity\brain\7354aa7d-333d-4e41-aa60-b81d1f0efc26\.user_uploaded\media_1790274996033.jpg"
dst_jpg = r"c:\Users\ohm\.bob\playground\migrant-saathi-ai\frontend\public\sabka_saath_duotone.jpg"

img = Image.open(src_path).convert("L")  # Convert to grayscale

# Apply duotone gradient mapping:
# Shadow color: Dark Red/Coral (#8B1E12)
# Highlight color: Bright Coral/Orange (#FF6B53)
shadow_col = (139, 30, 18)
highlight_col = (255, 107, 83)

duotone = ImageOps.colorize(img, black=shadow_col, white=highlight_col)
duotone.save(dst_jpg, "JPEG", quality=95)

print("Successfully generated coral duotone hero image:", dst_jpg)
