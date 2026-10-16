// Reseñas de pacientes (antes en Avena, 17 reseñas · 5.0). Solo nombre, sin fotos.
// Las que estaban en inglés van traducidas (traducido: true).
// Para sumar las de la encuesta de 21 días (Renovar.tsx), agrega una fila aquí.
export type Testimonio = { nombre: string; texto: string; tema: string; traducido?: boolean };

export const RESENAS = { total: 17, promedio: "5.0" };

export const TESTIMONIOS: Testimonio[] = [
  { nombre: "Rosa", tema: "Salud intestinal", texto: "Excelente nutrióloga, avances desde mi primer semana en mi inflamación intestinal, y físicos desde mi primer mes. ¡Realmente contenta!" },
  { nombre: "Giovanna", tema: "Comer rico y sano", traducido: true, texto: "Nunca imaginé que comer sano también podía ser comer rico. Lo que más valoro es cuánto escucha: nunca me sentí juzgada ni con una dieta irreal o demasiado restrictiva. Me ayudó a encontrar una forma de comer sana, equilibrada y que puedo sostener." },
  { nombre: "Marla", tema: "Bajar grasa sin perder músculo", texto: "Necesitaba adelgazar sin perder mi masa muscular. Me ha ayudado mucho, porque siento que puedo comer a gusto con lo que me manda y me mantiene saciada." },
  { nombre: "Jazmín", tema: "Mantener mi peso", texto: "Es mi primera vez con un plan alimenticio sano y el suyo ha sido el mejor. Me ha ayudado a mantener mi peso, que era mi objetivo, comiendo delicioso y saludable. Muy recomendable la nutrióloga Cecilia 🫶" },
  { nombre: "Ilse", tema: "Plan y ejercicio", texto: "Cecilia se toma el tiempo de entender mi estilo de vida, gustos, rutinas y objetivos para crear un plan nutricional real y sostenible. También me ayudó muchísimo con la técnica en el ejercicio." },
  { nombre: "Fernanda", tema: "Salud intestinal", texto: "La verdad es que me ha ayudado mucho, sobre todo en la parte intestinal. Sus planes son buenos y las recetas deliciosas." },
  { nombre: "Valeria", tema: "Desde Canadá", traducido: true, texto: "He tenido grandes cambios y me siento mucho mejor. En 2 o 3 meses he bajado 3 kg con la ayuda de Cecilia 🇨🇦" },
  { nombre: "Thelma", tema: "Desde México", traducido: true, texto: "Gran profesional ✨ Comida deliciosa y nutritiva 😋 mis favoritas son las crepas 🩷 Es muy amable y sabe escuchar. Tuve buenos resultados ✨ Con cariño desde México 🇲🇽" },
  { nombre: "Valeria M.", tema: "Alimentación y estilo de vida", texto: "Recomiendo mucho sus planes alimenticios, pues son súper exactos a lo que el paciente necesita. En lo personal me ayudó muchísimo con mi alimentación y estilo de vida." },
  { nombre: "Karla", tema: "Plan y actividad física", texto: "Cecy es una excelente profesional y una excelente persona. Consigue que los planes de alimentación y de actividad física se ajusten a las necesidades de cada persona." },
  { nombre: "Yannis", tema: "Desde Alemania", traducido: true, texto: "Estoy muy contento con el plan que Cecilia hizo para mí. Se ajustó muy bien a mis gustos, y lo mismo mi plan de entrenamiento. Vivo en Alemania, así que las consultas son en línea y no es ningún problema." },
  { nombre: "Karen", tema: "Seguimiento", traducido: true, texto: "Cecilia es una nutrióloga muy completa: siempre entiende muy bien mi objetivo, me manda dietas perfectas para mi estilo de vida y da seguimiento para aclarar todas mis dudas." },
  { nombre: "José", tema: "La app", traducido: true, texto: "Me gusta la comida que pone en mi dieta, todo es delicioso, y la app lo hace fácil: puedes elegir lo que quieres comer sin salirte de la dieta ni de las porciones. Además, siempre está disponible para cualquier duda." },
  { nombre: "Rosa M.", tema: "Acompañamiento", texto: "Ella está siempre muy al pendiente de sus pacientes, es muy profesional y comprensiva ❤️" },
  { nombre: "Luz", tema: "La app", texto: "Muy fácil de entender la app y la nutricionista es súper amable y comprensible." },
  { nombre: "Gise", tema: "Comida rica", texto: "¡Me gustó mucho! Comida deli y plan funcional." },
];
