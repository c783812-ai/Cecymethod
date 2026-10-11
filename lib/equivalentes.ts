import type { Color } from "./types";

// De la lista de equivalentes de Cecy. Cada renglón es una porción.
export const EQUIVALENTES: { grupo: string; kcal: string; color: Color; items: [string, string][] }[] = [
  { grupo: "Verduras", kcal: "≈ 25 kcal", color: "verde", items: [["Espinaca o acelga crudas", "2 tazas"], ["Lechuga, arúgula, canónigos (Feldsalat)", "3 tazas"], ["Brócoli cocido", "½ taza"], ["Coliflor cocida", "¾ taza"], ["Ejotes cocidos (grüne Bohnen)", "½ taza"], ["Calabacín cocido (Zucchini)", "½ taza"], ["Zanahoria rallada", "½ taza"], ["Jitomate", "1 pieza"], ["Jitomate cherry", "5 piezas"], ["Pepino rebanado", "1¼ tazas"], ["Pimiento crudo (Paprika)", "1 taza"], ["Champiñones crudos", "1 taza"], ["Col blanca o morada cruda", "1 taza"], ["Nopales cocidos", "1 taza"]] },
  { grupo: "Frutas", kcal: "≈ 60 kcal", color: "rosa", items: [["Manzana", "1 chica"], ["Pera", "½ pieza"], ["Plátano", "½ pieza"], ["Naranja", "2 chicas o 1 grande"], ["Mandarina", "2 piezas"], ["Kiwi", "1½ piezas"], ["Fresas", "1 taza"], ["Frambuesas (Himbeeren)", "1 taza"], ["Arándanos (Heidelbeeren)", "½ taza"], ["Uvas", "18 piezas"], ["Mango", "½ pieza"], ["Papaya picada", "1 taza"], ["Melón picado", "1 taza"]] },
];

export const MANO: [string, string, string][] = [
  ["✊", "Tu puño ≈ 1 taza", "Verduras cocidas, fruta picada, palomitas"],
  ["🤲", "Tu mano en cuenco ≈ ½ taza", "Arroz, pasta, frijoles, lentejas, avena"],
  ["🖐️", "Tu palma, sin dedos ≈ 90 g cocidos", "Pollo, carne o pescado = 3 porciones de proteína"],
  ["👍", "Tu pulgar completo ≈ 1 cucharada", "Crema de cacahuate, chía, hummus"],
  ["☝️", "La punta de tu dedo ≈ 1 cucharadita", "Aceite, mantequilla"],
];
