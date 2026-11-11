// "Voy a comer fuera": qué pedir según el tipo de lugar. Borrador para que Cecy lo revise y lo ajuste.

export type Lugar = { id: string; ic: string; n: string; pide: string[]; evita: string[]; tip: string };

export const REGLAS_FUERA: string[] = [
  "Arma tu plato así: la mitad verduras, una cuarta parte proteína y una cuarta parte carbohidrato (tortilla, arroz, pan o papa).",
  "Elige primero tu proteína: pollo, pescado, camarón, huevo, res magra o leguminosas.",
  "Pide salsas y aderezos aparte, y usa poquito.",
  "Asado, a la plancha, al vapor o al horno es mejor que empanizado, capeado o frito.",
  "Agua mineral, agua natural o té sin azúcar para acompañar.",
  "Come despacio y para cuando estés satisfecha, no llena. Si la porción es grande, pide para llevar desde el inicio.",
  "Una comida fuera no arruina tu semana: tu siguiente comida, como en tu plan.",
];

export const LUGARES: Lugar[] = [
  {
    id: "mexicana", ic: "🌮", n: "Mexicana",
    pide: ["Tacos de pollo, pescado, arrachera o al pastor en tortilla de maíz (2 o 3), con cebolla, cilantro y salsa", "Fajitas de pollo o res con verduras y 2 tortillas", "Caldo de pollo, tlalpeño o sopa de tortilla sin crema", "Ceviche o cóctel de camarón con tostadas horneadas", "Pollo o pescado a la plancha con ensalada y frijoles de la olla"],
    evita: ["Totopos de la mesa (sepáralos o pide que no los traigan)", "Chimichangas, flautas, chiles rellenos capeados", "Queso fundido, crema y frijoles refritos con manteca", "Margaritas y aguas frescas con azúcar"],
    tip: "Si hay totopos, sirve un puñito en tu plato y aleja la canasta.",
  },
  {
    id: "italiana", ic: "🍝", n: "Italiana",
    pide: ["Pescado o pollo a la parrilla con verduras", "Pasta con salsa de tomate (pomodoro, arrabbiata) con proteína, porción de entrada", "Ensalada caprese o de rúcula con proteína", "Minestrone", "Pizza de masa delgada con verduras: 1 o 2 rebanadas más una ensalada"],
    evita: ["Salsas de crema: alfredo, carbonara, cuatro quesos", "Pan con mantequilla o aceite antes de la comida", "Lasaña y pastas al horno con mucho queso"],
    tip: "Pide media porción de pasta o compártela, y agrega una ensalada.",
  },
  {
    id: "japonesa", ic: "🍣", n: "Sushi y japonesa",
    pide: ["Sashimi o nigiri de salmón, atún o pescado blanco", "Rollos sin empanizar ni queso crema (6 a 8 piezas)", "Edamames y sopa miso para empezar", "Ensalada de algas o pepino sunomono", "Pollo o salmón teriyaki con verduras, poco arroz"],
    evita: ["Rollos tempura, empanizados o con queso crema", "Salsa de anguila y mayonesa picante", "Mucha soya (tiene mucha sal)"],
    tip: "Empieza con edamames y miso: llegas con menos hambre al sushi.",
  },
  {
    id: "asiatica", ic: "🥢", n: "China, thai o asiática",
    pide: ["Pollo, camarón o tofu salteado con verduras", "Sopas claras (tom yum, wonton)", "Rollitos frescos (no fritos)", "Arroz al vapor, porción pequeña"],
    evita: ["Pollo agridulce, a la naranja o empanizado", "Arroz frito y tallarines fritos", "Curries con mucha leche de coco"],
    tip: "Pide el arroz aparte y sírvete la cantidad de tu plan.",
  },
  {
    id: "hamburguesas", ic: "🍔", n: "Hamburguesas",
    pide: ["Hamburguesa sencilla de res o pollo a la plancha, con lechuga, jitomate y cebolla", "Ensalada como guarnición en lugar de papas", "Hamburguesa sin pan o con medio pan si tienes mucha hambre de proteína"],
    evita: ["Doble carne, tocino y doble queso", "Papas fritas, aros de cebolla", "Malteadas y refresco"],
    tip: "Si se te antojan las papas, comparte una orden chica.",
  },
  {
    id: "asador", ic: "🥩", n: "Asador, parrilla o pollo",
    pide: ["Pollo asado, pescado o un corte magro (filete, sirloin, arrachera) de tamaño de tu mano", "Verduras asadas, nopales o ensalada", "Papa al horno chica o elote como carbohidrato"],
    evita: ["Cortes muy grasos (rib eye, picaña) y chorizo", "Puré con mantequilla y crema", "Pan de ajo"],
    tip: "Pide guarnición doble de verduras.",
  },
  {
    id: "mediterranea", ic: "🥙", n: "Mediterránea, griega o kebab",
    pide: ["Plato de pollo o falafel al horno con ensalada y hummus (2 cucharadas)", "Ensalada griega con proteína", "Souvlaki de pollo con tzatziki", "Medio pan pita"],
    evita: ["Döner en pan grande con salsas", "Papas fritas dentro del kebab", "Mucho queso feta y aceite"],
    tip: "Pide el kebab en plato (Teller) en lugar de pan: más verduras y menos harina.",
  },
  {
    id: "cafeteria", ic: "☕", n: "Cafetería o brunch",
    pide: ["Huevos (revueltos, pochados o en omelette) con verduras y pan integral", "Yogur griego natural con fruta y nueces", "Avocado toast con huevo", "Café americano, con leche o capuchino sin azúcar"],
    evita: ["Hot cakes, waffles y pan dulce", "Frappés y lattes con jarabes y crema batida", "Jugos (mejor la fruta entera)"],
    tip: "Si quieres algo dulce, comparte el postre y acompáñalo con tu proteína.",
  },
  {
    id: "fiesta", ic: "🎉", n: "Fiesta, boda o reunión",
    pide: ["Come una colación con proteína antes de salir para no llegar con hambre", "En la cena, plato principal con proteína y verduras", "Botana: verduras, carnes frías magras, queso en cubitos (un puñito)"],
    evita: ["Picar de todo mientras platicas", "Repetir plato", "Postre más de una vez"],
    tip: "Si tomas alcohol: un vaso de agua entre cada copa, y mejor vino, cerveza light o destilado con agua mineral que cócteles con refresco o jarabes.",
  },
  {
    id: "viaje", ic: "✈️", n: "Viaje o aeropuerto",
    pide: ["Ensalada o bowl con pollo, wrap o sándwich integral con proteína", "Yogur natural, fruta, nueces, huevos cocidos", "Barrita de proteína si no hay otra opción"],
    evita: ["Llegar con mucha hambre a la sala de espera", "Bebidas con azúcar y pan dulce de cafetería"],
    tip: "Lleva en tu bolsa una fruta y un puñito de nueces o tu proteína en polvo.",
  },
];
