// ─── Palabras clave por zona ─────────────────────────────
const PALABRAS_LUMBAR = [
  "lumbar", "espalda baja", "espalda", "lumbago", "ciática", "ciatica",
  "disco", "hernia", "columna",
];

const PALABRAS_RODILLA = [
  "rodilla", "menisco", "ligamento", "cruzado", "rótula", "rotula",
  "condromalacia", "tendón rotuliano", "tendon rotuliano",
];

// ─── Ejercicios a evitar por zona ───────────────────────
const ALERTAS_LUMBAR = [
  {
    ejercicio: "Peso muerto",
    alerta: "Evitar peso muerto en todas sus variantes. Alternativa: hip thrust con peso corporal o barra, curl femoral en máquina para trabajar el posterior sin cargar la columna.",
  },
  {
    ejercicio: "Sentadilla con barra",
    alerta: "Evitar sentadilla profunda con carga. Alternativa: sentadilla goblet, prensa de piernas o sentadilla en caja.",
  },
  {
    ejercicio: "Remo con barra",
    alerta: "Evitar remo inclinado en todas sus variantes. Alternativa: remo en máquina sentado o polea baja sentado,  donde el tronco permanece erguido sin carga lumbar.",
  },
  {
    ejercicio: "Sentadilla con peso corporal",
    alerta: "Limitar la profundidad en sentadilla. Evitar si hay dolor agudo durante el movimiento.",
  },
];

const ALERTAS_RODILLA = [
  {
    ejercicio: "Sentadilla con barra",
    alerta: "Evitar sentadilla profunda. Alternativa: sentadilla parcial, prensa de piernas con rango limitado.",
  },
  {
    ejercicio: "Sentadilla con peso corporal",
    alerta: "Limitar la profundidad. Evitar si hay dolor o chasquido en la rodilla durante el movimiento.",
  },
  {
    ejercicio: "Peso muerto",
    alerta: "Con precaución. Evitar si hay inestabilidad en la rodilla durante la fase de descenso.",
  },
];

// ─── Función principal ───────────────────────────────────
// Recibe el texto de lesiones y devuelve un array de alertas
export function generarAlertas(lesiones) {
  if (!lesiones || lesiones.trim() === "") return [];

  const texto     = lesiones.toLowerCase();
  const alertas   = [];

  // Detectar lesiones lumbares
  const tieneLumbar = PALABRAS_LUMBAR.some((palabra) => texto.includes(palabra));
  if (tieneLumbar) {
    alertas.push({
      zona:      "Lumbar / Espalda baja",
      icono:     "⚠️",
      tipo:      "advertencia",
      ejercicios: ALERTAS_LUMBAR,
    });
  }

  // Detectar lesiones de rodilla
  const tieneRodilla = PALABRAS_RODILLA.some((palabra) => texto.includes(palabra));
  if (tieneRodilla) {
    alertas.push({
      zona:      "Rodilla / Menisco",
      icono:     "⚠️",
      tipo:      "advertencia",
      ejercicios: ALERTAS_RODILLA,
    });
  }

  return alertas;
}