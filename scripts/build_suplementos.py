"""Pasa scripts/suplementos.json (investigación con etiquetas) a public/alimentos/suplementos.json."""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FR = {"½": 0.5, "¼": 0.25, "¾": 0.75}

out = []
for x in json.load(open(ROOT / "scripts" / "suplementos.json", encoding="utf-8")):
    m = re.match(r"^\s*([\d.,½¼¾]+)\s+(.*)$", x["porcion"])
    c, u = (FR.get(m.group(1)) or float(m.group(1).replace(",", ".")), m.group(2)) if m else (1, x["porcion"])
    pn = 0
    gm = re.search(r"\(([\d.,]+)\s*g\)", u)
    if gm:  # "medida (30 g)" -> "medida" y los gramos aparte, para que se multipliquen bien
        u, pn = u[: gm.start()].strip(), float(gm.group(1).replace(",", "."))
    # La nota la lee la paciente: solo el primer dato útil, sin comentarios internos
    partes = [t.strip() for t in re.split(r";", x.get("nota") or "") if t.strip() and not re.search(r"cecy|marca (mexicana|canadiense|alemana|española|suiza)", t, re.I)]
    nota = partes[0] if partes else ""
    if re.search(r"supradyn|centrum", x["n"], re.I):
        nota = (nota + " · revisa que sea la versión sin hierro").strip(" ·")
    out.append({"id": x["id"], "n": x["n"].replace(" – ", " · "), "g": x["g"], "c": c, "u": u, "pn": pn,
                "k": x.get("k"), "p": x.get("p"), "l": x.get("l"), "h": x.get("h"), "o": "sup",
                **({"nota": nota} if nota else {}), "paises": x.get("paises", [])})
(ROOT / "public" / "alimentos" / "suplementos.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(len(out))
