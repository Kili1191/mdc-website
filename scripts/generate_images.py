#!/usr/bin/env python3
"""
MDC — la serie photographique du site, tiree de la matiere reelle.

Ce script remplace `generate_atmospheres.py`, qui fabriquait des champs de
lumiere procéduraux. Un degrade genere se lit comme un travail inacheve en deux
secondes ; c'etait le seul vrai blocage du site.

Il n'y avait pourtant pas besoin d'inventer des images. `motif-compo-full.jpg`
est une photographie reelle en 5504x3072 du bas-relief d'onyx de la maison —
lotus sculptes, veinage chaud, et la maison de Kilian gravee en haut. C'est la
matiere de la marque, et personne d'autre ne l'a.

Chaque slot est donc un CADRAGE de cette meme pierre, a une distance
differente : du champ large au petale isole. Une seule matiere, une seule
lumiere, neuf distances. C'est ce qui fait une serie plutot qu'une collection.

Quatre traitements, appliques a tous, pour que ca se lise comme de la
photographie et non comme de la texture :

  1. le CADRAGE se prend dans les pixels d'origine, jamais agrandi ;
  2. une SOURCE DE LUMIERE unique, avec sa vraie decroissance — sans elle une
     texture reste plate, quelle que soit sa finesse ;
  3. une PROFONDEUR DE CHAMP : le flou croit avec la distance au point de
     nettete, comme une optique ouverte. C'est le signal le plus fort qu'un
     oeil lit « photographie » ;
  4. un ETALONNAGE Aube Encens commun, multiplicatif. Comme pour la gravure du
     marbre : on multiplie, on ne soustrait pas, sinon la pierre chaude vire au
     gris argent.

Grain et vignettage identiques partout : c'est ce qui donne l'impression d'un
seul appareil, d'une seule seance.
"""

import numpy as np
from PIL import Image, ImageFilter

SRC_STONE = "assets-source/motif-compo-full.jpg"      # bas-relief sculpte, 5504x3072
SRC_SMOOTH = "assets-source/albatre-lisse-full.jpg"   # albatre lisse, sans motif
OUT = "public/photos"

# Aube Encens
PARCHEMIN = np.array([0.929, 0.894, 0.816])
OCRE      = np.array([0.722, 0.600, 0.408])
ROUILLE   = np.array([0.647, 0.353, 0.243])
BROU      = np.array([0.290, 0.231, 0.165])


def load(path):
    return np.asarray(Image.open(path).convert("RGB"), dtype=np.float32) / 255.0


def crop(img, cx, cy, w, h, ratio):
    """Cadrage centre sur (cx, cy) en fractions, largeur w en fraction."""
    H, W = img.shape[:2]
    cw = int(W * w)
    ch = int(cw / ratio)
    if ch > H:
        ch = int(H * h)
        cw = int(ch * ratio)
    x = int(np.clip(cx * W - cw / 2, 0, W - cw))
    y = int(np.clip(cy * H - ch / 2, 0, H - ch))
    return img[y:y + ch, x:x + cw]


def light(shape, lx, ly, radius, strength, ambient):
    """Une source unique. La decroissance fait la profondeur, pas le contraste."""
    h, w = shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xx = (xx / w - lx) * (w / h)
    yy = yy / h - ly
    d = np.sqrt(xx * xx + yy * yy) / radius
    fall = np.exp(-d * d * 1.35)
    return (ambient + strength * fall)[..., None]


def depth_of_field(arr, fx, fy, span, maxblur):
    """
    Flou croissant avec la distance au point de nettete.

    Trois niveaux mélangés plutot qu'un flou uniforme : une optique ne passe
    pas du net au flou d'un coup, et un flou constant se lit comme un filtre.
    """
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xx = (xx / w - fx) * (w / h)
    yy = yy / h - fy
    d = np.clip(np.sqrt(xx * xx + yy * yy) / span, 0.0, 1.0)[..., None]

    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    b1 = np.asarray(im.filter(ImageFilter.GaussianBlur(maxblur * 0.35)), dtype=np.float32) / 255.0
    b2 = np.asarray(im.filter(ImageFilter.GaussianBlur(maxblur)), dtype=np.float32) / 255.0

    near = arr * (1 - np.clip(d * 2, 0, 1)) + b1 * np.clip(d * 2, 0, 1)
    far = b1 * (1 - np.clip(d * 2 - 1, 0, 1)) + b2 * np.clip(d * 2 - 1, 0, 1)
    return np.where(d < 0.5, near, far)


def grade(arr, warmth, depth, lift):
    """
    Etalonnage Aube Encens.

    Tout est multiplicatif. Soustraire pour l'ombre retire plus de rouge que de
    bleu et desature la pierre chaude vers le gris — l'erreur deja faite sur la
    gravure du marbre, corrigee la, a ne pas refaire ici.
    """
    lum = arr @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    lum = lum[..., None]
    # les hautes lumieres vont vers l'ocre, les ombres gardent leur teinte
    hi = np.clip((lum - 0.55) / 0.45, 0, 1)
    sh = np.clip((0.45 - lum) / 0.45, 0, 1)
    out = arr * (1.0 + warmth * hi * (OCRE / OCRE.mean() - 1.0))
    out = out * (1.0 - depth * sh * np.array([0.42, 0.60, 0.80], dtype=np.float32))
    out = out * (1.0 - lift) + PARCHEMIN * lift * lum
    return out


def expose(arr, target=0.815):
    """
    Poser la serie dans le registre du site.

    Les huit cadrages sortaient a des densites tres differentes, et tous plus
    sombres que la page. Mesure sur /sessions : luminance moyenne 149 pour
    l'image, 205 pour le marbre autour. L'image ne paraissait pas froide — elle
    etait chaude (R-B de 62 contre 36) — elle paraissait LOURDE. Un bloc sombre
    sur une page claire casse le calme qu'on vend.

    Une seule regle vaut mieux que huit expositions reglees a la main : on
    ramene chaque cadrage a la meme luminance moyenne, avec un epaulement dans
    les hautes lumieres pour ne pas bruler la pierre. La serie tient alors
    ensemble ET tient avec le fond.
    """
    lum = arr @ np.array([0.299, 0.587, 0.114], dtype=np.float32)
    m = float(lum.mean())
    if m <= 1e-4:
        return arr
    g = target / m
    out = arr * g
    # epaulement doux : au-dela de 0,86 on comprime au lieu de couper
    k = 0.86
    hi = out > k
    out[hi] = k + (1.0 - k) * np.tanh((out[hi] - k) / (1.0 - k))
    return out


def vignette(arr, amount):
    h, w = arr.shape[:2]
    yy, xx = np.mgrid[0:h, 0:w].astype(np.float32)
    xx = xx / w - 0.5
    yy = yy / h - 0.5
    d = np.sqrt(xx * xx + yy * yy) / 0.72
    return arr * (1.0 - amount * np.clip(d, 0, 1) ** 2.1)[..., None]


def grain(arr, amount, seed):
    rng = np.random.default_rng(seed)
    n = rng.normal(0.0, 1.0, arr.shape[:2]).astype(np.float32)
    n = np.asarray(Image.fromarray(((n * 0.5 + 0.5) * 255).clip(0, 255).astype(np.uint8))
                   .filter(ImageFilter.GaussianBlur(0.6)), dtype=np.float32) / 255.0 - 0.5
    # le grain mord dans les ombres, pas dans les hautes lumieres : c'est ainsi
    # qu'il se comporte sur une emulsion
    lum = (arr @ np.array([0.299, 0.587, 0.114], dtype=np.float32))[..., None]
    return arr + n[..., None] * amount * (1.15 - lum)


def save(arr, name, long_edge=1600, quality=82):
    a = np.clip(arr, 0, 1)
    im = Image.fromarray((a * 255).astype(np.uint8))
    if max(im.size) > long_edge:
        s = long_edge / max(im.size)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    path = f"{OUT}/{name}.jpg"
    im.save(path, "JPEG", quality=quality, subsampling=1, optimize=True, progressive=True)
    return path, im.size


# slot, source, cadrage (cx, cy, largeur, hauteur, ratio),
# lumiere (lx, ly, rayon, force, ambiant), nettete (fx, fy, portee, flou max),
# etalonnage (chaleur, profondeur, voile), vignettage, grain
PLAN = [
    # ANTARA — l'entree. Le cadre le plus ouvert : on voit ou l'on entre.
    ("si-01", SRC_STONE, (0.285, 0.545, 0.355, 1.0, 4 / 5),
     (0.24, 0.16, 0.98, 0.64, 0.50), (0.38, 0.46, 0.88, 7.0),
     (0.34, 0.28, 0.05), 0.28, 0.020),

    # VAYU — le souffle. Presque rien : de l'air et une lumiere qui passe.
    ("si-02", SRC_SMOOTH, (0.30, 0.52, 0.30, 1.0, 4 / 5),
     (0.70, 0.16, 0.90, 0.52, 0.52), (0.58, 0.44, 0.95, 8.0),
     (0.32, 0.26, 0.06), 0.30, 0.018),

    # SOMA — le corps, l'huile. Le plus proche, le plus profond.
    ("si-03", SRC_STONE, (0.50, 0.62, 0.17, 1.0, 4 / 5),
     (0.34, 0.24, 0.72, 0.78, 0.30), (0.48, 0.55, 0.52, 11.0),
     (0.46, 0.52, 0.02), 0.42, 0.026),

    # TRANSMISSION — la retenue. Une seule bande de lumiere, le reste tenu.
    ("si-04", SRC_STONE, (0.775, 0.38, 0.21, 1.0, 4 / 5),
     (0.32, 0.46, 0.60, 0.80, 0.34), (0.36, 0.48, 0.58, 10.0),
     (0.38, 0.42, 0.02), 0.34, 0.026),

    # PT-01 — la marque du praticien : la maison gravee dans la pierre.
    # Pas un portrait invente. Le vrai portrait de Kilian est la seule image
    # que lui seul peut fournir.
    ("pt-01", SRC_STONE, (0.503, 0.20, 0.20, 1.0, 4 / 5),
     (0.30, 0.20, 0.80, 0.70, 0.40), (0.50, 0.40, 0.85, 6.0),
     (0.34, 0.32, 0.03), 0.32, 0.020),

    # RT-01 — la retraite. Panoramique, la lumiere s'installe au centre.
    ("rt-01", SRC_STONE, (0.50, 0.50, 0.86, 1.0, 21 / 9),
     (0.50, 0.30, 1.05, 0.58, 0.52), (0.50, 0.46, 1.00, 8.0),
     (0.32, 0.26, 0.07), 0.34, 0.020),

    # LP-01 — Rishikesh. Vertical, la lumiere descend, le veinage coule.
    ("lp-01", SRC_STONE, (0.13, 0.55, 0.19, 1.0, 3 / 4),
     (0.50, 0.06, 1.00, 0.70, 0.40), (0.48, 0.52, 0.80, 8.0),
     (0.36, 0.34, 0.06), 0.36, 0.022),

    # LP-02 — Dharamshala. Vertical aussi, mais plus dur : une forme seule
    # contre un champ vide.
    ("lp-02", SRC_STONE, (0.88, 0.62, 0.19, 1.0, 3 / 4),
     (0.30, 0.22, 0.66, 0.86, 0.24), (0.36, 0.42, 0.60, 10.0),
     (0.42, 0.50, 0.02), 0.44, 0.024),
]


def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    cache = {}
    for (name, src, (cx, cy, cw, ch, ratio), (lx, ly, lr, ls, la),
         (fx, fy, fs, fb), (gw, gd, gl), vig, gr) in PLAN:
        if src not in cache:
            cache[src] = load(src)
        a = crop(cache[src], cx, cy, cw, ch, ratio)
        a = a * light(a.shape, lx, ly, lr, ls, la)
        a = depth_of_field(a, fx, fy, fs, fb)
        a = grade(a, gw, gd, gl)
        a = expose(a)
        a = vignette(a, vig)
        a = grain(a, gr, seed=abs(hash(name)) % (2 ** 31))
        path, size = save(a, name)
        kb = os.path.getsize(path) / 1024
        print(f"  {name:7s} {str(size):12s} {kb:6.0f} Ko")


if __name__ == "__main__":
    main()
