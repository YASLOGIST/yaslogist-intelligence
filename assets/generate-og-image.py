#!/usr/bin/env python3
"""YASLOGIST Intelligence — animated OG image generator.

Renders assets/og-image-animated.gif (1200x630, 40 frames) plus a static
assets/og-image.png fallback, using real data committed in data/ so the
social card never lies about what the dashboard shows.

PIL-only, fully offline (Latin glyphs only — DejaVu has no Arabic shaping).
Translucency rule: draw alpha colors onto an RGBA overlay and composite with
img.paste(ov, (0, 0), ov); PIL's ImageDraw does NOT alpha-blend.

Run:  python3 assets/generate-og-image.py
"""
import json
import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

W, H = 1200, 630
FRAMES = 40          # 40 × 90ms = 3.6s loop
ROOT = Path(__file__).resolve().parent.parent
OUT_GIF = ROOT / "assets" / "og-image-animated.gif"
OUT_PNG = ROOT / "assets" / "og-image.png"

FD = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
FMB = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"

def font(size, mono=True, bold=False):
    path = FMB if (mono and bold) else FM if mono else FB if bold else FD
    return ImageFont.truetype(path, size)

F_HERO = font(44, mono=False, bold=True)
F_KICK = font(19, mono=True, bold=True)
F_SMALL = font(13, mono=True)
F_TINY = font(11, mono=True)
F_MID = font(21, mono=True, bold=True)
F_BIG = font(32, mono=True, bold=True)

GOLD = (234, 179, 8)
CYAN = (6, 182, 212)
CRIMSON = (239, 68, 68)
PURPLE = (168, 85, 247)
GREEN = (16, 185, 129)
INK = (7, 9, 14)
PAPER = (244, 240, 230)
MUTE = (110, 122, 142)

CH_T = 6.6  # DejaVu mono cell width at size 11

# ------------------------------------------------------------------ real data
def load_json(name):
    with open(ROOT / "data" / name, encoding="utf-8") as f:
        return json.load(f)

def wire_lines():
    rows = []
    for it in load_json("intel_wire.json"):                      # list of wire items
        tags = it.get("tags") or []
        t0 = tags[0] if tags else "INTEL"
        if isinstance(t0, dict):
            t0 = t0.get("en") or next(iter(t0.values()), "INTEL")
        title = " ".join(str(it.get("titleEn") or it.get("title") or "").split())
        if title:
            rows.append((str(t0).upper()[:8] or "INTEL", title))
    return rows

def peak_cve():
    best = None
    for it in load_json("middle_east_cves.json"):                # list of cve rows
        s = float(it.get("cvss") or 0.0)
        if best is None or s > best[0]:
            best = (s, it.get("id", ""), it.get("system", ""), str(it.get("severity", "")).upper())
    return best or (0.0, "N/A", "", "")

def timeline():
    days = load_json("signal_timeline.json").get("days", [])     # [{date, count}]
    return [int(d.get("count") or 0) for d in days][-14:] or [0]

def mix(a, b, t):
    return tuple(round(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ------------------------------------------------------------------- helpers
def tracked(d, xy, text, f, color, tracking=0):
    x, y = xy
    for ch in text:
        d.text((x, y), ch, font=f, fill=color)
        x += int(d.textlength(ch, font=f)) + tracking

def overlay(img):
    ov = Image.new("RGBA", img.size, (0, 0, 0, 0))
    return ov, ImageDraw.Draw(ov)

def commit(img, ov):
    img.paste(ov, (0, 0), ov)   # mask = ov alpha → true alpha compositing

def glow(img, draw_group):
    lay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw_group(ImageDraw.Draw(lay))
    comp = Image.alpha_composite(lay.filter(ImageFilter.GaussianBlur(5)), lay)
    img.paste(comp, (0, 0), comp)

def panel(od, x0, y0, x1, y1, accent, title):
    od.rounded_rectangle([x0, y0, x1, y1], radius=6, fill=(13, 21, 36, 238), outline=(34, 48, 74, 255), width=1)
    od.rectangle([x0 + 12, y0 - 1, x0 + 56, y0 + 1], fill=accent + (255,))
    tracked(od, (x0 + 12, y0 + 9), title, F_TINY, accent, tracking=2)

# ------------------------------------------------------------ static chrome
def header(d, f):
    gold_a = mix(GOLD, (255, 214, 90), 0.5 + 0.5 * math.sin(2 * math.pi * 0 / FRAMES))
    d.text((56, 44), "YASLOGIST DEFENSE SYSTEMS", font=F_HERO, fill=gold_a)
    hx0 = 58
    hx1 = hx0 + d.textlength("YASLOGIST DEFENSE SYSTEMS", font=F_HERO)
    d.line([(hx0, 128), (hx1, 128)], fill=gold_a, width=4)
    d.line([(hx1 + 10, 128), (W - 56, 128)], fill=(31, 41, 58), width=2)
    x = 58
    for seg, col in [("SOVEREIGN CTI & LOGISTICS RADAR", CYAN), ("  ::  ", MUTE), ("GULF / LEVANT / RED SEA", GOLD)]:
        tracked(d, (x, 142), seg, F_KICK, col, tracking=3)
        x += d.textlength(seg, font=F_KICK) + 3 * len(seg)

def ecf_points():
    x0, y, waves = 60, 538, 608
    pts = []
    for i in range(0, waves + 1, 4):
        x = x0 + i
        m = i % 92
        yy = y
        if 12 <= m < 18:
            yy = y - 26 * (1 - abs(m - 15) / 3)
        elif 18 <= m < 24:
            yy = y + 16 * (1 - abs(m - 21) / 3)
        elif 30 <= m < 42:
            yy = y - 6 * math.sin((m - 30) / 12 * math.pi)
        pts.append((x, yy))
    return pts

def build_frame0():
    _, cve_id, product, sev = peak_cve()
    img = Image.new("RGB", (W, H), INK)
    d = ImageDraw.Draw(img)

    ov, od = overlay(img)
    for gy in range(0, H, 4):                                       # scanlines
        od.line([(0, gy), (W, gy)], fill=(255, 255, 255, 7), width=1)
    random.seed(7)
    for _ in range(90):                                             # starfield
        sx, sy = random.randint(0, W - 1), random.randint(0, H - 1)
        b = random.randint(60, 130)
        od.point((sx, sy), fill=(b + 60, b + 64, b + 76, 255))
    panel(od, 48, 168, 410, 476, CYAN, "TACTICAL THREAT SCOPE")
    panel(od, 430, 168, 896, 476, GOLD, "LIVE INTEL WIRE — VERIFIED MULTI-SOURCE")
    panel(od, 922, 168, 1150, 274, CRIMSON, "THREAT CONDITION")
    panel(od, 922, 286, 1150, 402, PURPLE, "PEAK CVE EXPOSURE")
    panel(od, 922, 414, 1150, 476, GREEN, "SIGNAL // 14D")
    panel(od, 48, 492, 698, 584, GOLD, "DIFFICULTY OF PEACE — LIVE HEARTBEAT")
    od.rounded_rectangle([444, 192, 882, 216], radius=4, fill=(9, 15, 26, 255), outline=(34, 48, 74, 255))
    commit(img, ov)
    d = ImageDraw.Draw(img)

    header(d, 0)
    bx, by, ln = 28, 28, 44
    for cx, cy, hx, hy in [(bx, by, 1, 1), (W - bx, by, -1, 1), (bx, H - by, 1, -1), (W - bx, H - by, -1, -1)]:
        d.line([(cx, cy), (cx + hx * ln, cy)], fill=GOLD, width=3)
        d.line([(cx, cy), (cx, cy + hy * ln)], fill=GOLD, width=3)

    for i, c in enumerate([CRIMSON, GOLD, GREEN]):
        d.ellipse([452 + i * 16, 199, 460 + i * 16, 207], fill=c)
    d.text((516, 198), "wire --tail -f --lang=ar/en --verify", font=F_TINY, fill=MUTE)

    # radar static geometry
    cx, cy, r = 229, 322, 92
    for rr in (32, 62, 92):
        d.ellipse([cx - rr, cy - rr, cx + rr, cy + rr], outline=(38, 56, 84), width=1)
    for ang in range(0, 360, 45):
        d.line([(cx, cy), (cx + r * math.cos(math.radians(ang)), cy + r * math.sin(math.radians(ang)))],
               fill=(28, 40, 60), width=1)
    d.text((64, 216), "BAB EL-MANDEB", font=F_TINY, fill=MUTE)
    d.text((330, 300), "HORMUZ", font=F_TINY, fill=MUTE)
    d.text((64, 434), "SUEZ", font=F_TINY, fill=MUTE)

    # right-column static captions
    d.text((936, 378), f"{cve_id} · {sev}", font=F_TINY, fill=MUTE)
    d.text((936, 390), product[:26], font=F_TINY, fill=MUTE)
    d.text((936, 458), f"NEW ACTIVITY · {timeline()[-1]:02d} EVENTS", font=F_TINY, fill=GOLD)

    d.line([(56, 492), (W - 56, 492)], fill=(31, 41, 58), width=2)
    d.text((58, 602), "30.0444°N 31.2357°E · CAIRO GRID · ZERO-BUILD STATIC EDGE", font=F_TINY, fill=MUTE)
    tracked(d, (W - 380, 602), "OBSERVE // CORRELATE // ANTICIPATE", F_TINY, GOLD, tracking=2)
    return img

# ------------------------------------------------------------ dynamic layer
BLIPS = [(118, 268, GOLD), (238, 214, CYAN), (292, 330, GOLD), (158, 352, CRIMSON)]
MDOTS = [(150, 236), (116, 318), (284, 240), (246, 300)]
BLINKS = [(314, 186, CRIMSON), (628, 274, GOLD), (966, 292, GOLD)]

def render_frame(f, template, pts):
    img = template.copy()
    t = 2 * math.pi * f / FRAMES

    # --- radar sweep (translucent fan)
    ov, od = overlay(img)
    cx, cy, r = 229, 322, 92
    ang = 2 * math.pi * f / FRAMES - math.pi / 2
    for k in range(44):
        a = ang - k * 0.017
        od.line([(cx, cy), (cx + r * math.cos(a), cy + r * math.sin(a))],
                fill=(6, 182, 212, max(4, 110 - k * 2)), width=2)
    commit(img, ov)
    d = ImageDraw.Draw(img)
    d.line([(cx, cy), (cx + r * math.cos(ang), cy + r * math.sin(ang))], fill=CYAN, width=2)
    blip_on = lambda i: math.sin(t + i * 1.7) > 0.15
    for i, (x, y, c) in enumerate(BLIPS):
        if blip_on(i):
            d.ellipse([x - 4, y - 4, x + 4, y + 4], outline=c, width=1)
            d.ellipse([x - 1.5, y - 1.5, x + 1.5, y + 1.5], fill=c)
    ov, od = overlay(img)
    for i, (x, y) in enumerate(MDOTS):
        rr = 3 + ((f + i * 9) % 26) * 0.55
        od.ellipse([x - rr, y - rr, x + rr, y + rr], outline=CYAN + (max(4, 80 - (f + i * 9) % 26 * 3),), width=1)
    for i, (x, y, c) in enumerate(BLINKS):
        if (f // 6 + i) % 2 == 0:
            od.ellipse([x - 2, y - 2, x + 2, y + 2], fill=c + (230,))
    commit(img, ov)
    d = ImageDraw.Draw(img)

    # --- intel wire (real titles, clipped to panel)
    rows = wire_lines()
    y0 = 222
    for i, (tag, title) in enumerate(rows[:14]):
        y = y0 + i * 18.0
        if y > 458:
            break
        tc = {"CYBER": CYAN, "CONFLICT": GOLD, "INFRASTR": GREEN, "MARITIME": GREEN, "GEOPOLIT": GOLD}.get(tag, MUTE)
        d.text((452, y + 2), f"[{tag:>8}]", font=F_TINY, fill=tc)
        avail = int((882 - 480 - 76) / CH_T)                     # ~49 chars max
        d.text((548, y + 2), title if len(title) <= avail else title[: avail - 1] + "…",
               font=F_TINY, fill=(200, 208, 222))
    ov, od = overlay(img)
    ly = y0 + min(len(rows), 13) * 18.0
    if (f // 2) % 2 == 0 and ly < 470:
        od.rectangle([452, ly + 2, 460, ly + 13], fill=GOLD + (210,))
    commit(img, ov)
    d = ImageDraw.Draw(img)

    # --- DEFCON meter (band from real peak severity)
    _, _, _, sev = peak_cve()
    lvl = {"CRITICAL": 2, "HIGH": 2, "MEDIUM": 3, "LOW": 4}.get(sev, 3)
    chip = CRIMSON if lvl <= 2 else GOLD
    cc = mix(chip, (255, 121, 40), 0.5 + 0.5 * math.sin(t * 1.3))
    d.text((936, 194), f"DEFCON {lvl}", font=F_BIG, fill=cc)
    bx = 936
    for n in range(5, 0, -1):
        on = n >= lvl
        d.rectangle([bx, 236, bx + 36, 254], fill=cc if on else None, outline=cc if on else (51, 65, 85), width=1)
        d.text((bx + 15, 239), str(n), font=F_TINY, fill=(7, 9, 14) if on else MUTE)
        bx += 42
    d.text((936, 258), "SEVERE REGIONAL TARGETING" if lvl <= 2 else "ELEVATED REGIONAL SIGNAL", font=F_TINY, fill=cc)

    # --- CVSS bar (real peak score)
    score, _, _, _ = peak_cve()
    d.text((936, 316), f"CVSS {score:.1f}", font=F_MID, fill=PURPLE)
    frac = min(1.0, score / 10.0)
    d.rectangle([936, 344, 1132, 354], fill=(51, 65, 85))
    d.rectangle([936, 344, 936 + int(196 * frac), 354], fill=PURPLE)
    tick = 936 + int(196 * frac * (0.5 + 0.5 * math.sin(t)))
    d.polygon([(tick - 4, 356), (tick + 4, 356), (tick, 364)], fill=PAPER)

    # --- 14-day sparkline (real counts)
    days = timeline()
    sx0, sy0, sx1, sy1 = 936, 430, 1140, 452
    mx = max(days) or 1
    d.line([(sx0, sy1), (sx1, sy1)], fill=(34, 48, 74), width=1)
    step = (sx1 - sx0) / max(1, len(days) - 1)
    sp = [(sx0 + i * step, sy1 - (v / mx) * (sy1 - sy0)) for i, v in enumerate(days)]
    if len(sp) > 1:
        d.line(sp, fill=mix(GOLD, CYAN, 0.25), width=1)
    for x, y in sp:
        d.ellipse([x - 1.5, y - 1.5, x + 1.5, y + 1.5], fill=GOLD)
    d.polygon([(sp[-1][0], sp[-1][1] - 5), (sp[-1][0] + 4, sp[-1][1]), (sp[-1][0], sp[-1][1] + 5), (sp[-1][0] - 4, sp[-1][1])], fill=GOLD)

    # --- ECG heartbeat with glow
    x0, waves = 60, 608
    phase = (f / FRAMES) * 6
    keep = []
    for (x, y) in pts:
        sx = x0 + ((x - x0 - phase * 12) % waves)
        if x0 <= sx <= x0 + waves:
            keep.append((sx, y))
    keep.sort()
    if len(keep) > 2:
        glow(img, lambda dg: dg.line(keep, fill=GOLD + (255,), width=2))
        d = ImageDraw.Draw(img)
        d.line(keep, fill=GOLD, width=2)
    hx, hy = keep[int(0.7 * len(keep))] if len(keep) > 3 else (x0 + 400, 538)
    d.ellipse([hx - 3, hy - 3, hx + 3, hy + 3], fill=(255, 214, 90))

    # --- live clock (opaque patch → no smear between frames)
    d.rectangle([W - 262, 50, W - 40, 106], fill=INK)
    secs = (23 * 3600 + 41 * 60 + 9 + f * 3) % 86400
    d.text((W - 260, 56), "SYS.CLOCK", font=F_TINY, fill=MUTE)
    d.text((W - 260, 72), f"{secs // 3600:02d}:{(secs // 60) % 60:02d}:{secs % 60:02d}Z", font=F_MID, fill=CYAN)
    if (f // 5) % 2 == 0:
        d.ellipse([W - 64, 90, W - 52, 102], fill=GREEN)
        d.text((W - 94, 88), "LIVE", font=F_TINY, fill=GREEN)

    return img

# ------------------------------------------------------------ build & save
def generate():
    score, cve_id, product, sev = peak_cve()
    print(f"data: {len(wire_lines())} wire rows · peak {cve_id} ({score}) · delta day {timeline()[-1]}")
    pts = ecf_points()
    template = build_frame0()
    rgb_frames = [render_frame(f, template, pts) for f in range(FRAMES)]
    master = rgb_frames[10].quantize(colors=128, method=Image.MEDIANCUT, dither=Image.Dither.NONE)
    pales = [fr.quantize(palette=master, dither=Image.Dither.NONE) for fr in rgb_frames]
    pales[0].save(OUT_GIF, save_all=True, append_images=pales[1:], duration=90, loop=0, disposal=1, optimize=True)
    rgb_frames[10].save(OUT_PNG, optimize=True)
    print(f"og-image-animated.gif  {FRAMES}f x 90ms  {OUT_GIF.stat().st_size // 1024} KB")
    print(f"og-image.png           static fallback  {OUT_PNG.stat().st_size // 1024} KB")

if __name__ == "__main__":
    generate()
