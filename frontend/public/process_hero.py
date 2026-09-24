import os
from PIL import Image, ImageFilter
import numpy as np

src_path = r"C:\Users\ohm\.gemini\antigravity\brain\7354aa7d-333d-4e41-aa60-b81d1f0efc26\.user_uploaded\media_1790274996033.jpg"
dst_png = r"c:\Users\ohm\.bob\playground\migrant-saathi-ai\frontend\public\sabka_saath_hero_integrated.png"

img = Image.open(src_path).convert("RGBA")
data = np.array(img)

# Target background color of the left sidebar: #0C2D27 -> R: 12, G: 45, B: 39
target_r, target_g, target_b = 12, 45, 39

r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]

# Identify white/light background wall pixels (high RGB values and low saturation)
brightness = (r.astype(int) + g.astype(int) + b.astype(int)) / 3.0
color_diff = np.maximum(np.maximum(np.abs(r.astype(int) - g.astype(int)), np.abs(g.astype(int) - b.astype(int))), np.abs(b.astype(int) - r.astype(int)))

# Background mask: High brightness (> 180) and low color variation (< 30)
bg_mask = (brightness > 185) & (color_diff < 35)

# Smooth transition mask (feathering background boundary)
mask_img = Image.fromarray((bg_mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))
smooth_bg_mask = np.array(mask_img).astype(float) / 255.0

# Blend original pixels with target background color #0C2D27
new_r = np.clip((1 - smooth_bg_mask) * r + smooth_bg_mask * target_r, 0, 255).astype(np.uint8)
new_g = np.clip((1 - smooth_bg_mask) * g + smooth_bg_mask * target_g, 0, 255).astype(np.uint8)
new_b = np.clip((1 - smooth_bg_mask) * b + smooth_bg_mask * target_b, 0, 255).astype(np.uint8)

new_data = np.stack([new_r, new_g, new_b, a], axis=-1)
result_img = Image.fromarray(new_data)
result_img.save(dst_png, "PNG")

print("Successfully generated integrated hero image:", dst_png)
