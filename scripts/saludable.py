"""Filtro de alimentos no saludables: lo que Cecy no quiere que la paciente pueda elegir.

motivo(nombre, grupo) -> texto con la razón, o None si el alimento se queda.
Criterio: fuera ultraprocesados, azúcar añadida, embutidos, fritos, harinas y pan blanco refinados,
grasas industriales y alcohol. Se quedan cerdo, lácteos naturales, cacahuate, soya, mariscos y aceites vegetales.
"""
import re, unicodedata

def _n(s):
    s = unicodedata.normalize("NFKD", str(s)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"\s+", " ", s).strip()

# Fuera aunque digan "sin azúcar"
FUERA = re.compile(r"chocolate con leche|paleta|^chocolate sin azucar$|koll.aid|kool.aid|refresco|y miel$|consome sabor")

# Se quedan aunque una regla de abajo los atrape
QUEDAN = re.compile(
    r"^miel( de abeja)?$|^miel \(honig\)|^chocolate amargo|chocolate (en polvo )?sin azucares?$|chocolate para reposteria sin azucar|"
    r"^cocoa sin azucar|^caca?o|^castana|^mole( poblano( preparado)?)?$|mole de pepita|^pipian|salsa de (cebollin|epazote)|"
    r"sin azucar|^jugod? de limon|bagel integral|chicle (casacabel|piquin|en polvo)|crema 20% grasa|nectarina|^aceite en spray$|^pam$|salmas|^gelatina (de dieta|sin azucar)|tortitas de arroz|reiswaffeln|muesli sin azucar|"
    r"bolillo integral|^grenetina")

REGLAS = [
    ("Embutido o carne procesada",
     r"jamon|schinken|salchic|salami|pepero|peperami|mortadela|chorizo|chistorra|longaniza|tocino|bacon|pastel de (pavo|puerco|ternera)|"
     r"patel de pollo|queso de puerco|\bpate\b|corned beef|pastrami|chicharron|moronga|morcilla|chilorio|aufschnitt|lardo"),
    ("Bebida azucarada, refresco o energizante",
     r"refresco|coca ?cola|cocca|coca light|diet coke|diet sprite|pepsi|sidral|squirt|orange crush|red bull|monster|^burn\b|^boost\b|"
     r"^tribu\b|so be rush|gatorade|bebida para deportistas|clight|koll.aid|kool.aid|jarabe|nestea|te helado|agua quina|ponche|"
     r"bebida lactea|\bnectar\b|^jugod? |cafe capuchino|dolc[ea] gusto|sabor moka|malteada|licuado de leche"),
    ("Dulce, postre o azúcar añadida",
     r"azucar (blanca|de mesa|glass|granulada|mascabado|morena)|piloncillo|melaza|miel de (cana|maiz)|cajeta|\bate\b|mermelada|"
     r"konfiture|jalea|leche condensada|chicle|chicloso|chewy|bubbaloo|bubulubu|panditas|skwinkes|crazy dips|cueritos|cristalizad|"
     r"merengue|merngue|malvavis|gelatina|flan|mousse|nieve|helad|paleta|almibar|en jarabe|maschino|maraschino|con azucar|"
     r"endulzad|azucarad|acaramelad|garapinad|confitad|palanqueta|cocada|mazapan|pralin|chocolate|choco|chispas de|almond joy|"
     r"kranky|lunetas|herchey|rompope|queso de tuna|pepinillos dulces|salsa de arandanos|cana de azucar|en dulce|camote poblano \(dulce\)|"
     r"con miel|miel maple|de sabor|sabor$|maicena sabor|jarabe de|salsa de manzana|crema en polvo para cafe|aspartame|nutra ?sweet"),
    ("Pan dulce, galleta, pastel o cereal azucarado",
     r"pan dulce|^concha|^orejas?$|orejas de pan|cuernito|^cuernos$|croissant|\bdonas?\b|bisquet|brownie|chees?cake|pastel|"
     r"\bpay\b|panque|muffin|miffin|wafle|hot ?cake|pop tarts|roles de canela|rollo de fresa|strudel|trenza|madalena|hojald|"
     r"pasta quebrada|costra para pay|base para pay|galleta|chips ahoy|\bbarras?\b|\bbarritas?\b|granola|nature valley|kinder|"
     r"rice krispies|fruitcake|pan de (jengibre|jenjibre|platano|miel|muesli)|pan bagel dulce|bimbunuelos|dalmata|pastitas|"
     r"harina para (brownies|hot cakes|reposteria)|senzo|snack mix|habaneras|barquillo|conos de|obelas|\bmarias\b|nutritas|"
     r"cereal chewy|zucaritas|cereal de trigo (con canela|sabor frutas)|chispas de yogur|frutas y yogur|varios sabores|atole|hojuelas de (cereales|maiz y trigo) con fruta|con cocoa|avena con (canela|manzana|pasitas)|avena integral con pasitas|instantaneas? con|cereal integral con pasitas|cereal con almendras y pasas|multibran pasas|mueslix"),
    ("Harina o pan blanco refinado",
     r"^harina$|harina blanca|^harina de trigo$|harina de arroz refinada|harina de trigo para|harina de algodon|pan blanco|"
     r"^pan de caja$|^bolillo|telera|birote|baguette|^bagel|pan bagel salado|bollos? (de|para) hamb|pan (de|para) hamb|"
     r"pan de hot dog|media noche|pambazo|bollo de pan \(brotchen\) blanco|pan molido|^tortilla de harina$|tortilla de maiz y trigo|"
     r"pan de ajo|crepa|pretzel|palitos de pan|crouton|sopa instan|ramen|con crema deshidratados|con tomate deshidratado|"
     r"fideo seco deshidratado|macarron con queso|papilla|hojuelas (de papa )?para pure|pure de papa hojuelas|papas hojuelas"),
    ("Frito o botana de bolsa",
     r"frit|freir|frituras|papa sal|hash brown|chips|totopos|^tostada$|tostada rayada|tostada tipo jalisco|doraditas|charritos|"
     r"botana|palomitas (con|garap|acaramel)|maiz palomero con mantequilla|chee?tos|runner|prispas|hot nuts|mafer|"
     r"cacahuate japones|cacahuates cubiertos|crispy|empaniz|palitos de pescado|\btamal\b"),
    ("Queso procesado",
     r"queso (amarillo|americano|tipo americano|pasteurizado|fundido|velveta)|velveta|cheez|fondue|sustituto de queso|salsa de queso"),
    ("Grasa industrial, aderezo o salsa de sobre",
     r"margarina|margarita|manteca|grasa de tocino|grasas animales|grasas vegetales|aceite de palma|aceite de soya y algodon|"
     r"aderezo(?! vinagreta casera)|^dip|aerosol|chantilly|crema para cafe|crema de leche en polvo|industrializada|salsa gravie|"
     r"demiglass|catsup|barbecue|teriyaki|salsa de tamarindo|vinagreta (comercial|baja)|salsa tartara"),
    ("Leche o yogur de sabor o azucarado",
     r"saborizad|leche (descremada |semi )?(con|sabor) (chocolate|vainilla)|leche en polvo sabor|natilla|yog.*(de fruta|con fruta)|"
     r"bebible frutas|sabor (fresa|durazno|pina|naranja|vainilla|ciruela|manzana|mango)|alf\*+ (fresa|mango|manzana)|vitalin|"
     r"maternizada|leche humana|leche materna|leche de burra|yoghur de (cafe|vainilla|soya)|petit suisse|chongos"),
    ("Consomé en cubo o en polvo",
     r"(consome|consiome|caldo|concentrado).*(polvo|cubo|concentrado|condesado)|cubo consome|concentrado de pollo"),
    ("Alcohol", r"cerveza|tequila|whisk|vodka|\bron\b|brandy|licor|mezcal|^vino\b"),
]
REGLAS = [(m, re.compile(r)) for m, r in REGLAS]

def motivo(nombre, grupo):
    n, g = _n(nombre), _n(grupo)
    if "etanol" in g or "alcohol" in g: return "Alcohol"
    if FUERA.search(n): return "Dulce, postre o azúcar añadida"
    if QUEDAN.search(n): return None
    if "c/azucar" in g or "leche con azucar" in g: return "Leche o yogur de sabor o azucarado"
    for m, r in REGLAS:
        if r.search(n): return m
    if g.startswith("azucar"): return "Dulce, postre o azúcar añadida"
    return None
