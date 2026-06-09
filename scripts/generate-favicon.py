#!/usr/bin/env python3
"""Generate FreshPlate favicon.ico — FP in terracotta on ink background."""

from pathlib import Path

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:
    raise SystemExit("Install Pillow: pip install Pillow")

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "favicon.ico"

TERRACOTTA = (196, 98, 45)
INK = (26, 26, 26)
SIZES = (16, 32, 48)


def render(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), INK + (255,))
    draw = ImageDraw.Draw(img)

    font_size = max(8, int(size * 0.44))
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Supplemental/Georgia Bold.ttf", font_size)
    except OSError:
        try:
            font = ImageFont.truetype("/Library/Fonts/Arial Bold.ttf", font_size)
        except OSError:
            font = ImageFont.load_default()

    text = "FP"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    x = (size - tw) // 2 - bbox[0]
    y = (size - th) // 2 - bbox[1] - max(0, int(size * 0.02))
    draw.text((x, y), text, font=font, fill=TERRACOTTA + (255,))

    # Subtle plate ring accent at larger sizes
    if size >= 32:
        margin = int(size * 0.1)
        draw.ellipse(
            [margin, margin, size - margin - 1, size - margin - 1],
            outline=TERRACOTTA + (90,),
            width=max(1, size // 32),
        )

    return img


def main() -> None:
    base = render(48)
    base.save(OUT, format="ICO", sizes=[(s, s) for s in SIZES])
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
