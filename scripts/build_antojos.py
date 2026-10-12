"""Pasa scripts/antojos.json (investigación con etiquetas) a public/alimentos/antojos.json."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
out = []
for x in json.load(open(ROOT / "scripts" / "antojos.json", encoding="utf-8")):
    nota = (x.get("nota") or "").split(";")[0].strip()
    a = {"id": x["id"], "n": x["n"].replace(" – ", " · "), "tipo": x["tipo"], "porcion": x["porcion"], "k": x.get("k"), "p": x.get("p"),
         "nota": nota or None, "paises": x.get("paises", [])}
    out.append({k: v for k, v in a.items() if v is not None})
(ROOT / "public" / "alimentos" / "antojos.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
print(len(out))
