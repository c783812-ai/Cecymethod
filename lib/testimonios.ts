// Reseñas de pacientes (antes en Avena, 17 reseñas · 5.0). Solo nombre, sin fotos.
// Las que están en inglés se dejan en inglés (ingles: true).
// Para sumar las de la encuesta de 21 días (Renovar.tsx), agrega una fila aquí.
export type Testimonio = { nombre: string; texto: string; tema: string; ingles?: boolean };

export const RESENAS = { total: 17, promedio: "5.0" };

export const TESTIMONIOS: Testimonio[] = [
  { nombre: "Rosa", tema: "Salud intestinal", texto: "Excelente nutrióloga, avances desde mi primer semana en mi inflamación intestinal, y físicos desde mi primer mes. ¡Realmente contenta!" },
  { nombre: "Marla", tema: "Bajar grasa sin perder músculo", texto: "Necesitaba adelgazar sin perder mi masa muscular. Me ha ayudado mucho, porque siento que puedo comer a gusto con lo que me manda y me mantiene saciada." },
  { nombre: "Jazmín", tema: "Mantener mi peso", texto: "Es mi primera vez con un plan alimenticio sano y el suyo ha sido el mejor. Me ha ayudado a mantener mi peso, que era mi objetivo, comiendo delicioso y saludable. Muy recomendable la nutrióloga Cecilia 🫶" },
  { nombre: "Ilse", tema: "Plan y ejercicio", texto: "Cecilia se toma el tiempo de entender mi estilo de vida, gustos, rutinas y objetivos para crear un plan nutricional real y sostenible. También me ayudó muchísimo con la técnica en el ejercicio." },
  { nombre: "Fernanda", tema: "Salud intestinal", texto: "La verdad es que me ha ayudado mucho, sobre todo en la parte intestinal. Sus planes son buenos y las recetas deliciosas." },
  { nombre: "Valeria", tema: "Desde Canadá", ingles: true, texto: "I’ve experienced great changes and being feeling better, so far in 2-3 months I’ve lost 3 kg with the help of Cecilia 🇨🇦🇨🇦🇨🇦" },
  { nombre: "Giovanna", tema: "Comer rico y sano", ingles: true, texto: "I am extremely happy with my experience! She has helped me so much, and I’m honestly so happy with the results I’ve seen so far. Before working with her, I never realized that eating healthy could also mean eating food that is actually delicious and enjoyable. She has completely changed the way I look at healthy eating. What I appreciate most is how much she truly listens. She takes the time to understand my concerns, struggles, and goals, and always addresses everything in such a professional and thoughtful way. I’ve never felt judged or like I had to follow an unrealistic or overly restrictive diet. Instead, she has helped me find a way of eating that feels healthy, balanced, and sustainable for me. I’m incredibly grateful for all of her help and guidance and would absolutely recommend her to anyone looking for a nutritionist who genuinely listens and cares about helping you reach your goals!" },
  { nombre: "Thelma", tema: "Desde México", ingles: true, texto: "Great professional ✨ Delicious and nutritious food 😋😋 my favorite are the crepes 🥹🩷 She is very kind and a good listener. I had good results ✨✨✨ Love from 🇲🇽 Mexico" },
  { nombre: "Valeria M.", tema: "Alimentación y estilo de vida", texto: "Recomiendo mucho sus planes alimenticios, pues son súper exactos a lo que el paciente necesita. En lo personal me ayudó muchísimo con mi alimentación y estilo de vida." },
  { nombre: "Karla", tema: "Plan y actividad física", texto: "Cecy es una excelente profesional y una excelente persona. Consigue que los planes de alimentación y de actividad física se ajusten a las necesidades de cada persona." },
  { nombre: "Yannis", tema: "Desde Alemania", ingles: true, texto: "I’m really happy with the nutrition plan Cecilia made for me. She adjusted well to my preferences. The same goes for my training plan which I really like. I’m from Germany so we’re having the consultations online and that’s no problem at all. I just had good experiences with her." },
  { nombre: "Karen", tema: "Seguimiento", ingles: true, texto: "Cecilia is a very complete nutritionist, she always manages to understand my goal very well and sends me perfect diets for my lifestyle and follows up to clarify all my doubts. She is definitely the ideal person to run my food plans." },
  { nombre: "José", tema: "La app", ingles: true, texto: "I like the food that she adds in my diet, all was delicious, and the app makes all easy: you can choose whatever you want to eat while you can’t break the diet or the portions. And also she is always available for any question." },
  { nombre: "Rosa M.", tema: "Acompañamiento", texto: "Ella está siempre muy al pendiente de sus pacientes, es muy profesional y comprensiva ❤️" },
  { nombre: "Luz", tema: "La app", texto: "Muy fácil de entender la app y la nutricionista es súper amable y comprensible." },
  { nombre: "Gise", tema: "Comida rica", texto: "¡Me gustó mucho! Comida deli y plan funcional." },
];
