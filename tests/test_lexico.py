"""Revisa que los textos del sitio y del README respeten el léxico de docs/LEXICO.md.

Mira el código y los textos escritos a mano. Los nombres oficiales de obras y entidades vienen en
los datos (web/data/*.json) y en los arreglos de datos incrustados en las páginas: esos se muestran
tal cual y no se revisan.
"""

import re
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[1]

PROHIBIDAS = [
    r"car[oa]s?", r"la m[aá]s cara", r"barat[oa]s?", r"viej[oa]s?", r"parad[oa]s?",
    r"plata", r"ni un sol", r"récords?", r"duelo", r"cara a cara",
    r"abandonad[oa]s?", r"corrupci[oó]n", r"mala gesti[oó]n", r"peor gesti[oó]n",
    r"derroch\w*", r"despilfarr\w*", r"desperdici\w*", r"malgast\w*",
    r"elefantes? blancos?", r"fracas\w*", r"desastr\w*", r"esc[aá]ndal\w*", r"verg[uü]enz\w*",
    r"culpa\w*", r"negligen\w*", r"se pararon", r"pararse", r"se par[oó]", r"obras chicas", r"enormes?",
]
PATRON = re.compile(r"(?<![\w-])(" + "|".join(PROHIBIDAS) + r")(?![\w-])", re.IGNORECASE)

ARCHIVOS = sorted(
    [*RAIZ.glob("web/*.html"), *RAIZ.glob("web/*.js"), *RAIZ.glob("web/js/*.js"), RAIZ / "README.md", RAIZ / "docs/DATA.md"]
)

# Líneas que son datos incrustados (arreglos con nombres oficiales de obras), no texto escrito.
DATOS = re.compile(r"^\s*(const|let|var)\s+[A-Z_]+\s*=\s*[\[{]|^\s*\[\s*-?\d")


def hallazgos():
    for archivo in ARCHIVOS:
        for n, linea in enumerate(archivo.read_text(encoding="utf-8").splitlines(), 1):
            # Se saltan solo los arreglos largos de datos; las constantes cortas con textos sí se revisan.
            if len(linea) > 2000 or (DATOS.search(linea) and len(linea) > 300):
                continue
            for m in PATRON.finditer(linea):
                yield f"{archivo.relative_to(RAIZ)}:{n}: «{m.group(0)}» en …{linea[max(0, m.start() - 40):m.end() + 40].strip()}…"


def test_textos_sin_palabras_a_evitar():
    malos = list(hallazgos())
    assert not malos, "Palabras a evitar (ver docs/LEXICO.md):\n" + "\n".join(malos)


def test_el_patron_detecta_y_respeta_limites():
    assert PATRON.search("La más antigua y las más viejas")
    assert PATRON.search("la obra más cara")
    assert not PATRON.search("obras paralizadas en Caraz")
    assert not PATRON.search("plataforma de datos")
    assert not PATRON.search("Obra Paralizada")
