#!/usr/bin/env python3
"""
Genere les 9 atmospheres Aube Encens de /public/photos/atmosphere/.

Ce ne sont pas des placeholders au sens "rectangle en attendant mieux".
Ce sont des champs de lumiere : la reference du site (Turrell, Sugimoto) est
faite de degrades et de valeurs, pas de detail photographique. Une matiere
construite au pixel tient donc le registre, la ou une image generique le
casserait.

Elles s'effacent d'elles-memes : AssetFrame regarde d'abord /photos/<slot>.jpg,
et ne retombe ici que si la vraie photo n'existe pas encore.

Palette stricte Aube Encens, aucune couleur hors charte.
    python3 scripts/generate_atmospheres.py
"""

import os
import numpy as np
from PIL import Image, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "photos", "atmosphere")
LOGO = os.path.join(os.path.dirname(__file__), "..", "public", "logo.png")

PARCHEMIN = (0xED, 0xE4, 0xD0)
BROU      = (0x4A, 0x3B, 0x2A)
BROU_F    = (0x2F, 0x25, 0x19)
SAUGE     = (0x8C, 0x8B, 0x6A)
TAUPE     = (0xA8, 0x9A, 0x85)
OCRE      = (0xB8, 0x99, 0x68)
ROUILLE   = (0xA5, 0x5A, 0x3E)

rng = np.random.default_rng(11)          # graine fixe : rendu reproductible


# ---------------------------------------------------------------- primitives

def _smooth(a):
    return a * a * (3.0 - 2.0 * a)


def value_noise(h, w, freq, seed):
    """Bruit de valeur lisse, interpolation cubique."""
    r = np.random.default_rng(seed)
    gh, gw = int(freq) + 2, int(freq) + 2
    grid = r.random((gh, gw))
    ys = np.linspace(0, gh - 2, h)
    xs = np.linspace(0, gw - 2, w)
    y0 = ys.astype(int)[:, None]
    x0 = xs.astype(int)[None, :]
    fy = _smooth((ys - ys.astype(int))[:, None])
    fx = _smooth((xs - xs.astype(int))[None, :])
    v00 = grid[y0, x0];         v10 = grid[y0 + 1, x0]
    v01 = grid[y0, x0 + 1];     v11 = grid[y0 + 1, x0 + 1]
    return (v00 * (1 - fy) * (1 - fx) + v01 * (1 - fy) * fx
            + v10 * fy * (1 - fx) + v11 * fy * fx)


def fbm(h, w, octaves=5, freq=3, seed=0):
    out = np.zeros((h, w)); amp = 1.0; norm = 0.0
    for o in range(octaves):
        out += amp * value_noise(h, w, freq * (2 ** o), seed + o * 97)
        norm += amp; amp *= 0.5
    return out / norm


def radial(h, w, cx, cy, rx, ry=None):
    """Champ 1 au centre, 0 au bord du rayon. cx/cy/rx en fraction."""
    ry = ry if ry is not None else rx
    yy = (np.linspace(0, 1, h)[:, None] - cy) / ry
    xx = (np.linspace(0, 1, w)[None, :] - cx) / rx
    d = np.sqrt(xx ** 2 + yy ** 2)
    return np.clip(1.0 - d, 0.0, 1.0)


def vgrad(h, w, top=0.0, bottom=1.0):
    return np.linspace(top, bottom, h)[:, None] * np.ones((1, w))


def mix(c_lo, c_hi, t):
    """Interpole deux couleurs RGB sur un champ t (h,w) -> image (h,w,3)."""
    t = np.clip(t, 0, 1)[..., None]
    lo = np.array(c_lo, float)
    hi = np.array(c_hi, float)
    return lo * (1 - t) + hi * t


def warm(img, amount=0.22):
    """Ramene toute la matiere vers l'axe chaud de la palette.

    Les assombrissements multiplicatifs desaturent vers le gris, et un gris
    froid est hors charte. On reinjecte de l'ocre proportionnellement a la
    luminance : les zones claires restent parcheminees, les sombres virent
    brou et non ardoise."""
    lum = img.mean(axis=2, keepdims=True) / 255.0
    target = np.array(OCRE, float) * lum + np.array(BROU_F, float) * (1 - lum)
    return img * (1 - amount) + target * amount


def grain(img, amount=0.010):
    """Grain argentique, identique aux shaders du site."""
    h, w = img.shape[:2]
    n = rng.normal(0, 1, (h, w, 1))
    return img + n * amount * 255.0


def vignette(img, strength=0.30):
    h, w = img.shape[:2]
    v = radial(h, w, 0.5, 0.5, 0.95, 0.95) ** 0.7
    return img * (1.0 - strength + strength * v[..., None])


def contrast(img, k=1.30, pivot=0.46):
    """Courbe en S douce. Sans elle tout s'entasse dans les tons moyens et les
    neuf images deviennent interchangeables."""
    x = img / 255.0
    x = np.clip((x - pivot) * k + pivot, 0, 1)
    x = x * x * (3 - 2 * x) * 0.35 + x * 0.65      # S tres doux
    return x * 255.0


def finish(img, path, soften=0.8):
    img = vignette(grain(contrast(warm(img))), strength=0.34)
    out = Image.fromarray(np.clip(img, 0, 255).astype("uint8"))
    if soften:
        out = out.filter(ImageFilter.GaussianBlur(soften))
    out.save(path, quality=92, optimize=True)
    print(f"  {os.path.basename(path):16s} {out.size[0]}x{out.size[1]}")


P45 = (1200, 1500)   # 4:5
P34 = (1200, 1600)   # 3:4
P219 = (2100, 900)   # 21:9


# ------------------------------------------------------------------- scenes

def ph01(path):
    """PH-01 — la pierre gravee. La maison MDC incisee dans l'onyx, lueur
    ambre au fond du trait. On grave le VRAI logo, pas une maison generique :
    c'est precisement la ou la generation par prompt echouait."""
    w, h = P45
    stone = fbm(h, w, 6, 3, seed=4)
    veins = fbm(h, w, 4, 7, seed=19)
    field = 0.30 + 0.42 * stone + 0.16 * veins
    img = mix(BROU_F, BROU, field)
    img += mix((0, 0, 0), OCRE, np.clip(veins - 0.62, 0, 1) * 1.5) * 0.5

    # lumiere rasante, un seul point chaud
    key = radial(h, w, 0.34, 0.30, 0.72, 0.66) ** 1.5
    img = img * (0.55 + 0.75 * key[..., None])

    # le logo comme masque de gravure
    logo = Image.open(LOGO).convert("RGBA")
    lw = int(w * 0.46)
    logo = logo.resize((lw, int(lw * logo.size[1] / logo.size[0])), Image.LANCZOS)
    canvas = Image.new("L", (w, h), 0)
    canvas.paste(logo.getchannel("A"), ((w - logo.size[0]) // 2,
                                        int(h * 0.40) - logo.size[1] // 2))
    inc = np.asarray(canvas, float) / 255.0

    # creux : le trait s'enfonce, s'assombrit, et rougeoie au fond
    deep = np.asarray(canvas.filter(ImageFilter.GaussianBlur(9)), float) / 255.0
    img = img * (1.0 - 0.55 * deep[..., None])
    ember = np.asarray(canvas.filter(ImageFilter.GaussianBlur(3)), float) / 255.0
    img += mix((0, 0, 0), OCRE, ember * 0.85) * 0.75
    img += mix((0, 0, 0), ROUILLE, inc * 0.5) * 0.35
    finish(img, path, soften=0.8)


def _light_field(seed, sources, floor=None, base=0.34, spread=0.56, size=None):
    """Une piece n'est pas une liste d'objets : c'est une quantite de lumiere
    et la maniere dont elle tombe. Chaque slot se distingue par la geometrie
    de ses sources, jamais par une forme dessinee."""
    w, h = size or P45
    tex = fbm(h, w, 3, 2, seed=seed)
    img = mix(BROU, PARCHEMIN, base + spread * tex)
    if floor is not None:
        f = np.clip((np.linspace(0, 1, h)[:, None] - floor) * 3.4, 0, 1) * np.ones((1, w))
        f = np.asarray(Image.fromarray((f * 255).astype("uint8"))
                       .filter(ImageFilter.GaussianBlur(h * 0.06)), float) / 255.0
        img = img * (1.0 - 0.22 * f[..., None])
    for cx, cy, rx, ry, strength, power in sources:
        g = radial(h, w, cx, cy, rx, ry) ** power
        img += mix((0, 0, 0), OCRE, g) * strength
    return img


def pt01(path):
    """PT-01 — le mur de parchemin, une presence hors champ. Pas de figure :
    une lumiere laterale et l'ombre que quelqu'un y laisse."""
    w, h = P45
    img = _light_field(31, [(0.10, 0.18, 0.58, 0.50, 0.52, 2.2)], base=0.30, spread=0.62)
    side = np.clip(1.0 - np.linspace(-0.30, 1.45, w), 0, 1)[None, :] * np.ones((h, 1))
    img = img * (0.70 + 0.42 * side[..., None] ** 1.2)
    presence = radial(h, w, 0.72, 0.70, 0.60, 0.86) ** 1.1
    img = img * (1.0 - 0.34 * presence[..., None])
    finish(img, path, soften=1.2)


def lp01(path):
    """LP-01 — l'aube sur l'eau. Brume, lumiere qui monte, rien de solide."""
    w, h = P34
    mist = fbm(h, w, 4, 2, seed=52)
    sky = vgrad(h, w, 1.0, 0.05)
    img = mix(TAUPE, PARCHEMIN, 0.28 + 0.64 * sky + 0.18 * mist)
    dawn = radial(h, w, 0.5, 0.34, 0.90, 0.46) ** 1.5
    img += mix((0, 0, 0), OCRE, dawn) * 0.50
    # l'eau : une bande plus sourde, bord fondu, jamais une arete
    band = np.clip((np.linspace(0, 1, h)[:, None] - 0.70) * 2.6, 0, 1) * np.ones((1, w))
    band = np.asarray(Image.fromarray((band * 255).astype("uint8"))
                      .filter(ImageFilter.GaussianBlur(h * 0.05)), float) / 255.0
    ripple = 0.55 + 0.45 * fbm(h, w, 3, 26, seed=63)
    img = img * (1.0 - 0.26 * band[..., None] * ripple[..., None])
    finish(img, path, soften=1.0)


def lp02(path):
    """LP-02 — les cretes lointaines. Des valeurs qui s'empilent dans la
    brume, une seule touche de rouille tres diffuse."""
    w, h = P34
    sky = vgrad(h, w, 1.0, 0.22)
    img = mix(TAUPE, PARCHEMIN, 0.32 + 0.62 * sky)
    xs = np.linspace(0, 1, w)[None, :]
    for i, (amp, base_y, dark, blur) in enumerate(
            [(0.10, 0.62, 0.13, 0.055), (0.07, 0.74, 0.20, 0.040)]):
        ridge = base_y - amp * np.abs(np.sin(xs * (2.1 + i) + i * 1.4))
        m = np.clip((np.linspace(0, 1, h)[:, None] - ridge) * 6.0, 0, 1)
        m = np.asarray(Image.fromarray((m * 255).astype("uint8"))
                       .filter(ImageFilter.GaussianBlur(h * blur)), float) / 255.0
        img = img * (1.0 - dark * m[..., None])
    ember = radial(h, w, 0.63, 0.45, 0.10, 0.16) ** 1.6
    img = img * (1 - 0.30 * ember[..., None]) + mix((0, 0, 0), ROUILLE, ember * 0.55)
    finish(img, path, soften=0.9)


def si01(path):
    """SI-01 — la chambre qui attend. Une seule source haute, le sol qui
    s'enfonce. Aucun meuble : le vide est le sujet."""
    img = _light_field(71, [(0.62, 0.22, 0.54, 0.62, 0.50, 1.9)], floor=0.58, base=0.26, spread=0.66)
    finish(img, path, soften=1.1)


def si02(path):
    """SI-02 — les rideaux de lin, un seul rai qui passe."""
    w, h = P45
    drape = fbm(h, w, 3, 2, seed=83)
    folds = 0.5 + 0.5 * np.sin(np.linspace(0, 1, w)[None, :] * 22.0
                               + 1.8 * drape) * np.ones((h, 1))
    img = mix(TAUPE, PARCHEMIN, 0.42 + 0.32 * folds + 0.26 * drape)
    xs = np.linspace(0, 1, w)[None, :] * np.ones((h, 1))
    ys = np.linspace(0, 1, h)[:, None] * np.ones((1, w))
    ray = np.exp(-((xs - 0.33 - 0.18 * ys) ** 2) / 0.0030)
    img += mix((0, 0, 0), OCRE, ray * 0.95) * 0.52
    finish(img, path, soften=1.1)


def si03(path):
    """SI-03 — le rituel. Plus sombre, une lueur basse et proche, comme une
    huile qui prend la lumiere. Pas de table dessinee."""
    img = _light_field(89, [(0.44, 0.70, 0.30, 0.22, 0.78, 1.0),
                            (0.44, 0.24, 0.60, 0.52, 0.10, 3.0)],
                       base=0.10, spread=0.34)
    finish(img, path, soften=1.0)


def si04(path):
    """SI-04 — le seuil. Un pan de rouille tres diffus au centre, une lumiere
    au-dessus qui dit que l'interieur est chaud. Jamais une porte nette."""
    w, h = P45
    img = _light_field(97, [(0.50, 0.14, 0.42, 0.24, 0.52, 1.3)],
                       base=0.34, spread=0.50)
    panel = radial(h, w, 0.50, 0.66, 0.26, 0.42) ** 1.1
    panel = np.asarray(Image.fromarray((panel * 255).astype("uint8"))
                       .filter(ImageFilter.GaussianBlur(w * 0.05)), float) / 255.0
    lac = 0.60 + 0.40 * fbm(h, w, 4, 6, seed=101)
    img = img * (1 - 0.72 * panel[..., None]) + mix(BROU, ROUILLE, lac) * (0.72 * panel[..., None])
    sill = radial(h, w, 0.5, 1.02, 0.36, 0.14) ** 1.1
    img = img * (1.0 - 0.38 * sill[..., None])
    finish(img, path, soften=0.8)


def rt01(path):
    """RT-01 — l'interieur vaste, la lumiere en flaque sur le sol."""
    w, h = P219
    walls = fbm(h, w, 3, 3, seed=113)
    img = mix(TAUPE, PARCHEMIN, 0.32 + 0.56 * walls)
    floor = (np.linspace(0, 1, h)[:, None] > 0.58).astype(float)
    floor = np.asarray(Image.fromarray((floor * 255).astype("uint8"))
                       .filter(ImageFilter.GaussianBlur(40)), float) / 255.0
    img = img * (1.0 - 0.30 * floor[..., None])
    for cx, r in ((0.30, 0.20), (0.62, 0.15)):
        pool = radial(h, w, cx, 0.78, r, 0.16) ** 1.5
        img += mix((0, 0, 0), OCRE, pool) * 0.42
    finish(img, path, soften=1.1)


SCENES = [
    ("ph-01.jpg", ph01), ("pt-01.jpg", pt01),
    ("lp-01.jpg", lp01), ("lp-02.jpg", lp02),
    ("si-01.jpg", si01), ("si-02.jpg", si02),
    ("si-03.jpg", si03), ("si-04.jpg", si04),
    ("rt-01.jpg", rt01),
]

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    print("Atmospheres Aube Encens :")
    for name, fn in SCENES:
        fn(os.path.join(OUT, name))
    print("ok")
