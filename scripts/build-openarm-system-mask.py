#!/usr/bin/env python3
"""Repair the missing OpenARM housing cap while preserving the original drawing."""

from pathlib import Path

import numpy as np
from PIL import Image, ImageChops, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets-source/system/openarm/openarm-blueprint.webp"
CAP_REFERENCE = ROOT / "assets-source/system/openarm/openarm-system-blueprint.webp"
OUTPUT = ROOT / "public/assets/images/system/openarm-system-blueprint-refined.webp"
TOP_SAFETY = 32


def extract_housing_cap(size: tuple[int, int]) -> tuple[Image.Image, Image.Image]:
    """Align and extract the complete housing cap from the supplied reference."""
    reference = Image.open(CAP_REFERENCE).convert("RGBA")
    reference_alpha = reference.getchannel("A")

    # Shared corners in the complete reference and in the fine original.
    # Solving all three simultaneously accounts for their slight local skew;
    # a global scale/offset cannot align both sides of this housing.
    reference_points = np.array(
        [[803, 79, 1], [974, 61, 1], [995, 70, 1]],
        dtype=float,
    )
    original_points = np.array(
        [[468, 84], [652, 58], [676, 65]],
        dtype=float,
    )
    forward = np.linalg.solve(reference_points, original_points)
    linear = np.array(
        [[forward[0, 0], forward[1, 0]], [forward[0, 1], forward[1, 1]]]
    )
    offset = np.array([forward[2, 0], forward[2, 1]])
    inverse = np.linalg.inv(linear)
    inverse_offset = -inverse @ offset

    # Isolate the complete cap, including its upper sight edge, before warping.
    source_region = Image.new("L", reference.size, 0)
    ImageDraw.Draw(source_region).polygon(
        [(800, 25), (985, 0), (1012, 75), (990, 78), (975, 67), (795, 86), (795, 65)],
        fill=255,
    )
    isolated = ImageChops.multiply(reference_alpha, source_region)
    aligned = isolated.transform(
        size,
        Image.Transform.AFFINE,
        (
            inverse[0, 0],
            inverse[0, 1],
            inverse_offset[0],
            inverse[1, 0],
            inverse[1, 1],
            inverse_offset[1],
        ),
        resample=Image.Resampling.BICUBIC,
    )
    aligned = aligned.filter(ImageFilter.MinFilter(3))

    # Replace, rather than overlay, the incomplete original cap. This removes
    # its two orphaned mini-strokes and prevents doubled perspective lines.
    replace_region = Image.new("L", size, 0)
    ImageDraw.Draw(replace_region).polygon(
        [(447, 34), (684, 4), (690, 72), (676, 72), (652, 65), (468, 91), (451, 91)],
        fill=255,
    )
    return aligned, replace_region


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    cap, replace_region = extract_housing_cap(source.size)
    retained_original = ImageChops.multiply(
        source.getchannel("A"),
        ImageChops.invert(replace_region),
    )
    repaired_alpha = ImageChops.lighter(
        retained_original,
        cap,
    )
    # Preserve the fine original side walls immediately below the two joins.
    # These narrow restores close the transition without bringing back either
    # of the orphaned strokes that originally protruded above the roof edge.
    side_restore_region = Image.new("L", source.size, 0)
    side_restore = ImageDraw.Draw(side_restore_region)
    side_restore.polygon([(445, 84), (480, 78), (485, 150), (440, 150)], fill=255)
    side_restore.polygon([(646, 57), (680, 63), (700, 150), (650, 150)], fill=255)
    repaired_alpha = ImageChops.lighter(
        repaired_alpha,
        ImageChops.multiply(source.getchannel("A"), side_restore_region),
    )
    orphan_cleanup = Image.new("L", source.size, 0)
    ImageDraw.Draw(orphan_cleanup).rectangle((438, 55, 452, 82), fill=255)
    cleaned_cap = ImageChops.multiply(cap, ImageChops.invert(orphan_cleanup))
    repaired_alpha = ImageChops.lighter(
        ImageChops.multiply(repaired_alpha, ImageChops.invert(orphan_cleanup)),
        cleaned_cap,
    )
    repaired = Image.new("RGBA", source.size, (255, 255, 255, 0))
    repaired.putalpha(repaired_alpha)

    output = Image.new("RGBA", (source.width, source.height + TOP_SAFETY), (255, 255, 255, 0))
    output.alpha_composite(repaired, (0, TOP_SAFETY))
    output.save(OUTPUT, format="WEBP", lossless=True, method=6, exact=True)
    print(f"Created {OUTPUT} ({output.width}x{output.height})")


if __name__ == "__main__":
    main()
