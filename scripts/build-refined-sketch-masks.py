#!/usr/bin/env python3
"""Build individually calibrated sketch masks matching The System references."""

from __future__ import annotations

import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE_DIR = ROOT / "assets-source/possible-futures/source-sketches/png"
OUTPUT_DIR = ROOT / "assets-source/possible-futures/system-style-masks-refined"
PADDING = 16
TARGET_ALPHA_MEDIAN = 185.0

# Each adjustment was selected after comparing normalized line widths with
# the archived PATON operator reference and openarm-blueprint.webp. A quarter/half/one
# pixel operation is performed at increased resolution to retain antialiasing.
PROFILES: dict[str, tuple[str, int, int]] = {
    "humanoid-arms-knipex-pliers": ("none", 1, 0),
    "humanoid-with-rose": ("dilate", 4, 1),
    "openarm-bottle-color": ("erode", 2, 2),
    "operator-vr-paton-glove": ("dilate", 4, 1),
    "paton-glove-handshake": ("dilate", 4, 1),
    "paton-glove-pov": ("dilate", 4, 1),
    "paton-glove-suit": ("none", 1, 0),
    "robot-rubber-chicken-color": ("dilate", 4, 1),
    "robot-rubber-chicken-outline": ("dilate", 4, 1),
    "static-haptic": ("erode", 2, 1),
    "vr-hydrogen-engine-touch": ("dilate", 4, 1),
}


def paired_names() -> list[str]:
    black = {path.name.removesuffix("-black.png") for path in SOURCE_DIR.glob("*-black.png")}
    white = {path.name.removesuffix("-white.png") for path in SOURCE_DIR.glob("*-white.png")}
    if black != white:
        raise RuntimeError(f"Incomplete sketch pairs: black={sorted(black)}, white={sorted(white)}")
    if black != set(PROFILES):
        raise RuntimeError(
            f"Profiles do not match sources. Missing={sorted(black - set(PROFILES))}; "
            f"obsolete={sorted(set(PROFILES) - black)}"
        )
    return sorted(black)


def refine_geometry(alpha: Image.Image, operation: str, scale: int, passes: int) -> Image.Image:
    if operation == "none":
        return alpha

    enlarged = alpha.resize((alpha.width * scale, alpha.height * scale), Image.Resampling.LANCZOS)
    filter_type = ImageFilter.MinFilter if operation == "erode" else ImageFilter.MaxFilter
    for _ in range(passes):
        enlarged = enlarged.filter(filter_type(3))
    return enlarged.resize(alpha.size, Image.Resampling.LANCZOS)


def normalize_alpha(alpha: Image.Image) -> Image.Image:
    values = np.asarray(alpha, dtype=np.float32)
    values[values < 3] = 0
    visible = values[values > 0]
    if visible.size == 0:
        raise RuntimeError("Refinement removed every visible pixel")

    median = float(np.median(visible))
    gamma = math.log(TARGET_ALPHA_MEDIAN / 255.0) / math.log(median / 255.0)
    gamma = min(1.35, max(0.68, gamma))
    normalized = np.where(values > 0, 255.0 * np.power(values / 255.0, gamma), 0)
    return Image.fromarray(np.clip(normalized, 0, 255).astype(np.uint8), "L")


def tight_canvas(alpha: Image.Image) -> Image.Image:
    bounds = alpha.getbbox()
    if bounds is None:
        raise RuntimeError("Mask contains no visible pixels")
    cropped = alpha.crop(bounds)
    output = Image.new("RGBA", (cropped.width + PADDING * 2, cropped.height + PADDING * 2), (255, 255, 255, 0))
    lines = Image.new("RGBA", cropped.size, (255, 255, 255, 255))
    lines.putalpha(cropped)
    output.alpha_composite(lines, (PADDING, PADDING))
    return output


def build(name: str) -> tuple[int, int]:
    black = Image.open(SOURCE_DIR / f"{name}-black.png").convert("RGBA")
    white = Image.open(SOURCE_DIR / f"{name}-white.png").convert("RGBA")
    if black.size != white.size:
        raise RuntimeError(f"Sketch pair has different dimensions: {name}")

    alpha = ImageChops.lighter(black.getchannel("A"), white.getchannel("A"))
    operation, scale, passes = PROFILES[name]
    alpha = refine_geometry(alpha, operation, scale, passes)
    alpha = normalize_alpha(alpha)
    output = tight_canvas(alpha)

    png_dir = OUTPUT_DIR / "png"
    webp_dir = OUTPUT_DIR / "webp"
    png_dir.mkdir(parents=True, exist_ok=True)
    webp_dir.mkdir(parents=True, exist_ok=True)
    output.save(png_dir / f"{name}-mask.png", optimize=True)
    output.save(webp_dir / f"{name}-mask.webp", format="WEBP", lossless=True, method=6, exact=True)
    return output.size


def main() -> None:
    for name in paired_names():
        width, height = build(name)
        operation, scale, passes = PROFILES[name]
        print(f"{name}: {width}x{height} ({operation}, scale={scale}, passes={passes})")
    print(f"Created {len(PROFILES)} refined PNG masters and WebP masks in {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
