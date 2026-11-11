// Las guías de Cecy (aprobadas el 11 nov 2026). Se piden por WhatsApp: ella manda el comprobante y Cecy le manda el PDF.
import { dinero } from "./pagos";

export type Guia = { id: string; titulo: string; texto: string; incluye: string[]; precio: [number, number, number] | null };

const BASE = ["Recetas con cantidades reales y el método de cada una: estufa, air fryer, horno o sin cocinar", "Ingredientes fáciles de encontrar y baratos, en México y en Europa", "En cada receta: cómo combinarla en tu día, el error más común y cantidades para 2 o 4 personas"];

export const GUIAS: Guia[] = [
  { id: "desayunos-proteina", titulo: "7 desayunos altos en proteína", precio: null, texto: "Desayunos con sabor a casa, con cantidades reales, para empezar el día con energía y sin hambre a media mañana.", incluye: ["7 desayunos con su proteína bien calculada", "Cómo armar tu desayuno como en las recetas", ...BASE.slice(1)] },
  { id: "meal-prep", titulo: "Meal prep en 1 hora", precio: [15, 17, 290], texto: "Cocina una vez y come rico toda la semana. Dos semanas completas, con el paso a paso minuto a minuto y la lista del súper.", incluye: ["2 semanas de comidas listas", "Paso a paso minuto a minuto", "Lista del súper", ...BASE] },
  { id: "air-fryer", titulo: "Air fryer: recetas fáciles", precio: [12, 14, 240], texto: "Comidas completas, crujientes y sin freír. Todo listo en 15 a 30 minutos con lo que hay en cualquier súper.", incluye: ["5 trucos para tu air fryer", ...BASE] },
  { id: "cenas-15", titulo: "Cenas listas en 15 minutos", precio: [12, 14, 240], texto: "Para cuando llegas cansada y lo último que quieres es cocinar. Cenas completas, ligeras y con proteína.", incluye: ["Tu despensa de emergencia", ...BASE] },
  { id: "sabor-a-casa", titulo: "Sabor a casa: comida mexicana saludable", precio: [15, 17, 290], texto: "Los platillos de casa en versión saludable, con ingredientes que encuentras aunque vivas lejos de México.", incluye: ["Qué cambia en tus recetas de siempre", ...BASE] },
  { id: "lunch-box", titulo: "Lunch box para llevar", precio: [12, 14, 240], texto: "Comidas que aguantan la mochila, se comen frías o se calientan en el micro de la oficina.", incluye: ["Tips para que tu lunch box llegue perfecto", ...BASE] },
  { id: "antojos", titulo: "Antojos y colaciones sin culpa", precio: [12, 14, 240], texto: "Dulces y saladitos de menos de 150 kcal, para quitarte el antojo sin sentir que echaste todo a perder.", incluye: ["Opciones dulces y saladas de menos de 150 kcal", ...BASE.slice(1, 2)] },
  { id: "poco-dinero", titulo: "Comer sano con poco dinero", precio: [12, 14, 240], texto: "Comidas completas con los ingredientes más baratos del súper, y los trucos para que tu dinero rinda más.", incluye: ["Trucos para que tu dinero rinda", ...BASE] },
  { id: "ri-sop", titulo: "Resistencia a la insulina y SOP: qué comer", precio: [25, 29, 490], texto: "Qué es, qué comer y qué hábitos te ayudan a bajar la insulina, con recetas fáciles para todos los días.", incluye: ["Explicación clara de qué es y cómo te afecta", "Hábitos que te ayudan a bajar la insulina", ...BASE] },
  { id: "comer-fuera", titulo: "Comer fuera y de viaje", precio: [12, 14, 240], texto: "Qué pedir en cada restaurante, cómo comer en el hotel o el avión, y 4 comidas sin cocinar con lo del súper.", incluye: ["Qué pedir en cada tipo de restaurante", "Cómo comer en el hotel y en el avión", "4 comidas sin cocinar con lo del súper"] },
];

export const precioTexto = (g: Guia) => (g.precio ? `${dinero(g.precio[0], "EUR")} · ${dinero(g.precio[1], "USD")} · ${dinero(g.precio[2], "MXN")}` : "Gratis");
export const whatsGuia = (g: Guia) =>
  `https://wa.me/971556889063?text=${encodeURIComponent(g.precio ? `Hola Cecy, quiero la guía “${g.titulo}” (${dinero(g.precio[0], "EUR")}). En un momento te envío mi comprobante 🙂` : `Hola Cecy, quiero tu guía gratis “${g.titulo}” 🙂`)}`;
