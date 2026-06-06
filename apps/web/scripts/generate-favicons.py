"""Generate favicon assets from the FMS Think Tank oval logo."""

from __future__ import annotations

from pathlib import Path

from PIL import Image

SOURCE = Path(
    r"C:\Users\fmsay\.cursor\projects\c-Users-fmsay-Documents-FMS-Expert-Agents\assets"
    r"\c__Users_fmsay_AppData_Roaming_Cursor_User_workspaceStorage_c0161a26dcb83c6476d06b6ad8f84cbb_images_image-9df15170-7d1c-4f52-a49b-f73b08d6fd8f.png"
)
APP_DIR = Path(__file__).resolve().parents[1] / "app"
PUBLIC_DIR = Path(__file__).resolve().parents[1] / "public"


def fit_square(img: Image.Image, size: int, *, crop_box: tuple[int, int, int, int] | None = None) -> Image.Image:
    """Resize logo into a square canvas with white background."""
    working = img.crop(crop_box) if crop_box else img
    canvas = Image.new("RGBA", (size, size), (255, 255, 255, 255))
    working = working.convert("RGBA")
    scale = min(size / working.width, size / working.height)
    new_w = max(1, round(working.width * scale))
    new_h = max(1, round(working.height * scale))
    resized = working.resize((new_w, new_h), Image.Resampling.LANCZOS)
    offset = ((size - new_w) // 2, (size - new_h) // 2)
    canvas.paste(resized, offset, resized)
    return canvas.convert("RGB")


def main() -> None:
    source = Image.open(SOURCE).convert("RGBA")
    width, height = source.size

    # Tighter crop on the "fms" script for very small favicons.
    small_crop = (
        int(width * 0.08),
        int(height * 0.06),
        int(width * 0.92),
        int(height * 0.62),
    )

    APP_DIR.mkdir(parents=True, exist_ok=True)
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    outputs: list[tuple[Path, int, tuple[int, int, int, int] | None]] = [
        (APP_DIR / "icon.png", 512, None),
        (APP_DIR / "apple-icon.png", 180, None),
        (PUBLIC_DIR / "favicon-16x16.png", 16, small_crop),
        (PUBLIC_DIR / "favicon-32x32.png", 32, small_crop),
        (PUBLIC_DIR / "apple-touch-icon.png", 180, None),
        (PUBLIC_DIR / "icon-192x192.png", 192, None),
        (PUBLIC_DIR / "icon-512x512.png", 512, None),
    ]

    ico_sizes = [16, 32, 48]
    ico_images: list[Image.Image] = []

    for path, size, crop in outputs:
        image = fit_square(source, size, crop_box=crop)
        path.parent.mkdir(parents=True, exist_ok=True)
        image.save(path, optimize=True)
        print(f"Wrote {path} ({size}x{size})")

    for size in ico_sizes:
        crop = small_crop if size <= 32 else None
        ico_images.append(fit_square(source, size, crop_box=crop))

    ico_path = PUBLIC_DIR / "favicon.ico"
    ico_images[0].save(
        ico_path,
        format="ICO",
        sizes=[(img.width, img.height) for img in ico_images],
        append_images=ico_images[1:],
    )
    print(f"Wrote {ico_path} ({', '.join(f'{s}x{s}' for s in ico_sizes)})")


if __name__ == "__main__":
    main()
