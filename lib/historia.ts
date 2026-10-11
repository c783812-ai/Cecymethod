// Campos de la historia clínica de Cecy (5 hojas). Solo los ve ella.
export type Campo = [key: string, label: string, tipo?: "texto" | "largo" | "fecha" | "numero"];
export const HISTORIA: { hoja: string; campos: Campo[] }[] = [
  { hoja: "Datos generales y motivo", campos: [
    ["fecha_consulta", "Fecha de consulta", "fecha"], ["fuera_desde", "¿Hace cuánto vive fuera?"], ["ocupacion", "Ocupación y horario"], ["vive_con", "¿Con quién vive?"], ["whatsapp", "WhatsApp"], ["como_me_conocio", "¿Cómo me conoció?"],
    ["motivo", "¿Qué la trae a consulta? En sus palabras", "largo"], ["objetivo", "Objetivo principal y para cuándo", "largo"], ["intentos", "¿Qué ha intentado antes y cómo le fue?", "largo"], ["lista_cambiar", "Del 1 al 10, ¿qué tan lista para cambiar?", "numero"], ["preocupacion", "¿Qué le preocupa de empezar?", "largo"],
  ]},
  { hoja: "Salud, ciclo y síntomas", campos: [
    ["diagnosticos", "Diagnósticos médicos (anemia, hipotiroidismo, SOP, resistencia a la insulina…)", "largo"], ["cirugias", "Cirugías"], ["medicamentos", "Medicamentos: cuál, dosis, desde cuándo", "largo"], ["suplementos", "Suplementos que toma hoy", "largo"],
    ["alergias", "Alergias alimentarias"], ["intolerancias", "Intolerancias"], ["familia", "Antecedentes familiares", "largo"],
    ["fur", "Fecha de última regla", "fecha"], ["ciclo", "Ciclo: cada cuántos días, días de sangrado, regularidad", "largo"], ["anticonceptivo", "Anticonceptivo: tipo y desde cuándo"], ["embarazo", "Embarazos, lactancia, planea embarazo, menopausia"],
    ["sintomas", "Síntomas desde que vive fuera", "largo"], ["sintoma_principal", "¿Cuál le afecta más y desde cuándo?"], ["energia", "Energía (1–10)", "numero"], ["estres", "Estrés (1–10)", "numero"], ["sueno", "Horas de sueño y si despierta descansada"], ["evacuaciones", "Evacuaciones por semana y consistencia"], ["agua", "Litros de agua al día"],
  ]},
  { hoja: "Estilo de vida y alimentación", campos: [
    ["ejercicio", "Ejercicio: qué, veces por semana, minutos", "largo"], ["pasos", "Pasos al día"], ["sol", "Minutos de sol y bloqueador"], ["cafe_te", "Café y té al día"], ["alcohol_tabaco", "Alcohol y tabaco"],
    ["cocina", "¿Quién cocina? ¿Para cuántas personas?"], ["super", "Súper donde compra"], ["presupuesto", "Presupuesto semanal de comida"], ["comidas_fuera", "Veces que come fuera por semana"], ["meal_prep", "¿Tiene tiempo para meal prep?"], ["horarios", "Horarios: se levanta, desayuna, come, cena, duerme"],
    ["tipo_dieta", "Omnívora, vegetariana, vegana, sin cerdo, sin lácteos, sin gluten…"], ["no_gusta", "Alimentos que no le gustan o no tolera", "largo"], ["extrana", "Lo que más extraña de la comida de su país"], ["emocional", "¿Come con ansiedad, aburrimiento o estrés?"], ["equipo_cocina", "Equipo de cocina"], ["frecuencia", "Frecuencia de consumo (veces por semana)", "largo"],
  ]},
  { hoja: "Recordatorio de 24 horas y mediciones", campos: [
    ["r24_desayuno", "Desayuno", "largo"], ["r24_colacion1", "Colación de la mañana", "largo"], ["r24_comida", "Comida", "largo"], ["r24_colacion2", "Colación de la tarde", "largo"], ["r24_cena", "Cena", "largo"], ["r24_bebidas", "Bebidas del día y antojos nocturnos", "largo"], ["fin_semana", "¿El fin de semana come distinto?", "largo"],
    ["estatura", "Estatura (cm)", "numero"], ["peso_habitual", "Peso habitual"], ["peso_mudarse", "Peso al mudarse"],
  ]},
  { hoja: "Mi lectura y plan", campos: [
    ["hallazgos", "Hallazgos principales: qué está bajo, en el límite, qué refiero al médico", "largo"], ["enfoques", "Enfoques del plan (máximo 3)", "largo"], ["acuerdos", "Acuerdos para la primera semana", "largo"], ["control", "Análisis de control: cuáles y cuándo", "largo"],
  ]},
];

export const MARCADORES: [string, string][] = [
  ["Hemoglobina", "g/dL"], ["Hematocrito", "%"], ["VCM", "fL"], ["Ferritina", "µg/L"], ["Hierro sérico", ""], ["Saturación de transferrina", "%"], ["PCR", "mg/L"],
  ["Vitamina D (25-OH)", "ng/mL"], ["Vitamina B12", "pg/mL"], ["Folato", "ng/mL"], ["TSH", "mUI/L"], ["T4 libre", ""], ["Glucosa en ayuno", "mg/dL"], ["HbA1c", "%"],
  ["Colesterol total", "mg/dL"], ["LDL", "mg/dL"], ["HDL", "mg/dL"], ["Triglicéridos", "mg/dL"],
];
