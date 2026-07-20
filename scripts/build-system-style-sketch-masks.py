#!/usr/bin/env python3
"""Build neutral, tightly cropped CSS masks from paired Possible Futures sketches."""

from pathlib import Path

from PIL import Image, ImageChops


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets-source/possible-futures/source-sketches/png"
OUTPUT_DIR = ROOT / "assets-source/possible-futures/system-style-masks"
PADDING = 16


def motif_names() -> list[str]:
    black = {path.name.removesuffix("-black.png") for path in SOURCE_DIR.glob("*-black.png")}
    white = {path.name.removesuffix("-white.png") for path in SOURCE_DIR.glob("*-white.png")}
    if black != white:
        missing_black = sorted(white - black)
        missing_white = sorted(black - white)
        raise RuntimeError(
            f"Sketch pairs are incomplete. Missing black: {missing_black}; missing white: {missing_white}"
        )
    return sorted(black)


def build_mask(name: str) -> tuple[int, int]:
    black = Image.open(SOURCE_DIR / f"{name}-black.png").convert("RGBA")
    white = Image.open(SOURCE_DIR / f"{name}-white.png").convert("RGBA")
    if black.size != white.size:
        raise RuntimeError(f"Sketch pair has different dimensions: {name}")

    # Both sources describe the same motif. Combining their coverage preserves
    # fine antialiased edges and colored components without redrawing anything.
    alpha = ImageChops.lighter(black.getchannel("A"), white.getchannel("A"))
    bounds = alpha.getbbox()
    if bounds is None:
        raise RuntimeError(f"Sketch pair contains no visible pixels: {name}")

    cropped_alpha = alpha.crop(bounds)
    output = Image.new(
        "RGBA",
        (cropped_alpha.width + PADDING * 2, cropped_alpha.height + PADDING * 2),
        (255, 255, 255, 0),
    )
    white_lines = Image.new("RGBA", cropped_alpha.size, (255, 255, 255, 255))
    white_lines.putalpha(cropped_alpha)
    output.alpha_composite(white_lines, (PADDING, PADDING))

    png_dir = OUTPUT_DIR / "png"
    webp_dir = OUTPUT_DIR / "webp"
    png_dir.mkdir(parents=True, exist_ok=True)
    webp_dir.mkdir(parents=True, exist_ok=True)
    output.save(png_dir / f"{name}-mask.png", optimize=True)
    output.save(
        webp_dir / f"{name}-mask.webp",
        format="WEBP",
        lossless=True,
        method=6,
        exact=True,
    )
    return output.size


def main() -> None:
    names = motif_names()
    for name in names:
        width, height = build_mask(name)
        print(f"{name}: {width}x{height}")
    print(f"Created {len(names)} PNG masters and {len(names)} WebP masks in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
