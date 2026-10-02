#!/usr/bin/env python3
"""
YASLOGIST // App icon generator (zero dependencies).

Renders the tactical radar-reticle brand mark at 512x512 and 192x192 and
writes PNGs next to this script. Used to feed manifest.webmanifest /
apple-touch-icon without shipping a binary design tool into the repo.

Run:  python3 assets/generate-app-icon.py
"""

import math
import os
import struct
import zlib

HERE = os.path.dirname(os.path.abspath(__file__))

# Brand palette (kept in sync with styles.css tokens).
BG = (7, 9, 14)        # #07090e command-deck background
CYAN = (6, 182, 212)   # #06B6D4 primary telemetry cyan
GOLD = (234, 179, 8)   # #EAB308 alert gold
CRIMSON = (239, 68, 68)  # #EF4444 alert crimson
SLATE = (148, 163, 184)  # #94A3B8 grid slate


def clamp(x):
    return max(0, min(255, int(round(x))))


def mix(a, b, t):
    return tuple(clamp(a[i] + (b[i] - a[i]) * t) for i in range(3))


def render(size=512, ss=2):
    """Radar reticle: concentric rings, crosshair, gold sweep wedge, center pip."""
    n = size * ss
    px = [[BG for _ in range(n)] for _ in range(n)]
    cx = cy = (n - 1) / 2.0
    r_max = n * 0.46

    def blend(x, y, color, alpha):
        if alpha <= 0 or x < 0 or y < 0 or x >= n or y >= n:
            return
        old = px[y][x]
        px[y][x] = mix(old, color, min(1.0, alpha))

    # --- dark radial vignette (depth) ---
    for y in range(n):
        for x in range(n):
            d = math.hypot(x - cx, y - cy) / r_max
            if d < 1.0:
                px[y][x] = mix((10, 14, 22), BG, d)  # slightly lighter core

    # --- gold sweep wedge (radar beam, 42 degrees, fading tail) ---
    sweep_start = -0.62  # radians
    for y in range(n):
        for x in range(n):
            dx, dy = x - cx, y - cy
            d = math.hypot(dx, dy)
            if d > r_max:
                continue
            ang = math.atan2(dy, dx) - sweep_start
            ang %= math.pi * 2  # positive modulo: 0..2pi measured from the sweep start
            if ang > 0.74:  # wedge width
                continue
            tail = 1.0 - (ang / 0.74)          # bright at the leading edge
            falloff = 1.0 - (d / r_max) ** 1.4  # brighter near center
            alpha = 0.9 * (tail ** 1.2) * max(0.30, falloff)
            blend(x, y, GOLD, alpha)

    # --- concentric rings + crosshair + tick marks (anti-aliased by distance) ---
    rings = [0.92, 0.68, 0.44, 0.20]
    for y in range(n):
        for x in range(n):
            dx, dy = x - cx, y - cy
            d = math.hypot(dx, dy) / r_max
            # rings
            for i, rr in enumerate(rings):
                band = abs(d - rr) * r_max
                ring_w = (3.4 if i == 0 else 2.2) * ss
                if band < ring_w:
                    t = 1.0 - band / ring_w
                    color = GOLD if i == 0 else CYAN
                    alpha = t * (0.98 if i == 0 else 0.8 - 0.12 * i)
                    blend(x, y, color, alpha)
            # crosshair (skip inside the innermost ring to keep the pip clean)
            if d > 0.14:
                if abs(dx) < 0.9 * ss or abs(dy) < 0.9 * ss:
                    blend(x, y, CYAN, 0.5)
            # outer tick marks every 30 degrees
            if 0.955 < d < 1.0:
                ang = math.atan2(dy, dx)
                deg = math.degrees(ang) % 30
                if deg < 3.2 or deg > 26.8:
                    blend(x, y, SLATE, 0.7)

    # --- center pip (gold core + crimson halo ring) ---
    for y in range(n):
        for x in range(n):
            d = math.hypot(x - cx, y - cy)
            if d < 7.0 * ss:
                blend(x, y, GOLD, 1.0)
            elif d < 9.0 * ss:
                blend(x, y, GOLD, 0.6)
            elif d < 12.0 * ss:
                t = 1.0 - (d - 9.0 * ss) / (3.0 * ss)
                blend(x, y, CRIMSON, 0.9 * t)

    # --- rounded-square frame mask (transparent corners) ---
    radius = n * 0.19
    frame = [(0, 0, 0, 0)] * n  # per-row alpha computed on the fly instead
    del frame
    out = [[(0, 0, 0, 0) for _ in range(n)] for _ in range(n)]
    for y in range(n):
        for x in range(n):
            # rounded-rect distance
            rx = min(x, n - 1 - x)
            ry = min(y, n - 1 - y)
            if rx < radius and ry < radius:
                corner = math.hypot(radius - rx, radius - ry)
                if corner > radius:
                    continue  # stays transparent
            # border glow on the rounded rect edge
            edge = min(rx, ry)
            glow = 1.0 - min(1.0, edge / (3.0 * ss))
            c = px[y][x]
            if glow > 0:
                c = mix(c, CYAN, 0.45 * glow)
            out[y][x] = (c[0], c[1], c[2], 255)

    return out, n


def downscale(img, n, size):
    """Box-filter downscale from the supersampled canvas."""
    factor = n // size
    rows = []
    for y in range(size):
        row = []
        for x in range(size):
            r = g = b = a = 0
            count = 0
            for yy in range(y * factor, (y + 1) * factor):
                for xx in range(x * factor, (x + 1) * factor):
                    p = img[yy][xx]
                    r += p[0]; g += p[1]; b += p[2]; a += p[3]
                    count += 1
            row.append((r // count, g // count, b // count, a // count))
        rows.append(row)
    return rows


def write_png(path, img):
    h = len(img)
    w = len(img[0])
    raw = b''.join(
        b'\x00' + b''.join(struct.pack('4B', *p) for p in row)
        for row in img
    )

    def chunk(tag, data):
        c = struct.pack('>I', len(data)) + tag + data
        return c + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    ihdr = struct.pack('>IIBBBBB', w, h, 8, 6, 0, 0, 0)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', ihdr)
           + chunk(b'IDAT', zlib.compress(raw, 9))
           + chunk(b'IEND', b''))
    with open(path, 'wb') as f:
        f.write(png)
    print(f'wrote {path} ({w}x{h}, {len(png) // 1024} KB)')


def main():
    img, n = render(size=512, ss=2)
    write_png(os.path.join(HERE, 'yaslogist-icon-512.png'), downscale(img, n, 512))
    write_png(os.path.join(HERE, 'yaslogist-icon-192.png'), downscale(img, n, 192))


if __name__ == '__main__':
    main()
