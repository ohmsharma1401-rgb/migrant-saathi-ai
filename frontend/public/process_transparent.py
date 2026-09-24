import os
from PIL import Image, ImageFilter
import numpy as np

src_path = r"C:\Users\ohm\.gemini\antigravity\brain\7354aa7d-333d-4e41-aa60-b81d1f0efc26\.user_uploaded\media_1790274996033.jpg"
dst_png = r"c:\Users\ohm\.bob\playground\migrant-saathi-ai\frontend\public\sabka_saath_hero_transparent.png"

img = Image.open(src_path).convert("RGBA")
data = np.array(img)

r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

# Identify white/light background wall pixels
brightness = (r.astype(int) + g.astype(int) + b.astype(int)) / 3.0
color_diff = np.maximum(np.maximum(np.abs(r.astype(int) - g.astype(int)), np.abs(g.astype(int) - b.astype(int))), np.abs(b.astype(int) - r.astype(int)))

bg_mask = (brightness > 185) & (color_diff < 35)

# Smooth alpha transition
mask_img = Image.fromarray((bg_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
smooth_bg_mask = np.array(mask_img).astype(float) / 255.0

new_alpha = np.clip((1 - smooth_bg_mask) * 255, 0, 255).astype(np.uint8)

new_data = np.stack([r, g, b, new_alpha], axis=-1)
result_img = Image.fromarray(new_data)
result_img.save(dst_png, "PNG")

print("Successfully generated transparent hero image:", dst_png)
