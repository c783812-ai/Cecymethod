"""Arma lib/tiendaProductos.json: productos de la investigación (scripts/tienda_investigacion.json, si existe)
más las proteínas en polvo de scripts/suplementos.json, para comprarlas en línea."""
import json, os, re
D = os.path.dirname(os.path.abspath(__file__))
MERC = {"MX": "MX", "US": "US", "CA": "CA", "UK": "UK", "ES": "ES", "DE": "DE", "CH": "DE", "EU": "DE", "AE": "AE"}
out = []
inv = os.path.join(D, "tienda_investigacion.json")
if os.path.exists(inv):
    out += json.load(open(inv))
for x in json.load(open(os.path.join(D, "suplementos.json"))):
    if x["g"] != "Proteína en polvo":
        continue
    nombre = x["n"].split(" – ", 1)[1] if " – " in x["n"] else x["n"]
    base = re.sub(r"\s*\(.*?\)", "", nombre).strip()
    vegetal = re.search(r"vegan|vegetal|chícharo", x["nota"], re.I)
    paises = sorted({MERC[c] for c in x["paises"] if c in MERC})
    out.append({"cat": "proteina-vegetal" if vegetal else "proteina-whey", "n": nombre, "marca": x["marca"], "pres": x["porcion"],
                "busca": f'{x["marca"]} {base}', "urls": {}, "paises": paises, "sup": x["id"],
                **({"nota": "La que usa Cecy"} if "usa Cecy" in x["nota"] else {"nota": "La que recomienda Cecy"} if "recomienda Cecy" in x["nota"] else {})})
# Si la investigación encontró la misma marca en esa categoría, la proteína usa esos links directos.
inv_p = [x for x in out if "sup" not in x]
for x in out:
    if "sup" not in x:
        continue
    for y in inv_p:
        if y["cat"] == x["cat"] and y["marca"].lower() == x["marca"].lower() and " ".join(x["n"].split()[:2]).lower() in y["n"].lower():
            for k, v in y["urls"].items():
                x["urls"].setdefault(k, v)
            if y.get("ml"):
                x.setdefault("ml", y["ml"])
# Links de afiliada de Mercado Libre (los saca Cecy): link nuevo, o null si el producto ya no se vende ahí.
mla = os.path.join(D, "ml_afiliados.json")
if os.path.exists(mla):
    m = json.load(open(mla))
    for x in out:
        if x.get("ml") in m:
            if m[x["ml"]]:
                x["ml"] = m[x["ml"]]
            else:
                del x["ml"]
json.dump(out, open(os.path.join(D, "..", "lib", "tiendaProductos.json"), "w"), ensure_ascii=False, indent=1)
print(len(out), "productos")
