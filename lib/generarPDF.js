import jsPDF from "jspdf";

// ─── Paleta de colores ───────────────────────────────────
const NARANJA      = [220, 88, 20];      // naranja más apagado
const NARANJA_SUAVE = [255, 107, 26];
const BLANCO       = [235, 235, 235];
const GRIS_CLARO   = [150, 150, 150];
const GRIS         = [100, 100, 100];
const FONDO        = [12, 12, 12];
const FONDO_CARD   = [22, 22, 22];
const FONDO_CARD2  = [18, 18, 18];

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio:   "Intermedio",
  avanzado:     "Avanzado",
};

function colorNivel(nivel) {
  if (nivel === "avanzado")   return [107, 176, 64];
  if (nivel === "intermedio") return [212, 151, 58];
  return [74, 143, 204];
}

function seccionLabel(pdf, texto, y) {
  pdf.setTextColor(...NARANJA_SUAVE);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text(texto, 14, y);
  // Línea decorativa
  pdf.setDrawColor(...NARANJA);
  pdf.setLineWidth(0.3);
  pdf.line(14 + pdf.getTextWidth(texto) + 3, y - 1, 196, y - 1);
}

export async function generarPDF(cliente, evaluacion, alertas) {
  const pdf   = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const ancho = pdf.internal.pageSize.getWidth();
  let y       = 0;

  // ─── Fondo negro ────────────────────────────────────────
  pdf.setFillColor(...FONDO);
  pdf.rect(0, 0, ancho, 297, "F");

  // ─── Header compacto ────────────────────────────────────
  // Franja naranja delgada arriba
  pdf.setFillColor(...NARANJA);
  pdf.rect(0, 0, ancho, 2, "F");

  // Contenido del header
  y = 10;

  // Logo FE cuadradito
  pdf.setFillColor(...NARANJA);
  pdf.roundedRect(14, 6, 12, 12, 2, 2, "F");
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(8);
  pdf.setFont("helvetica", "bold");
  pdf.text("FE", 20, 14, { align: "center" });

  // Nombre app
  pdf.setTextColor(...BLANCO);
  pdf.setFontSize(14);
  pdf.setFont("helvetica", "bold");
  pdf.text("FitEval", 30, 12);

  // Slogan debajo del nombre
  pdf.setFontSize(7);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRIS);
  pdf.text("No hay excusas, hay datos.", 30, 17);

  // Fecha y firma a la derecha
  const fecha = new Date().toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" });
  pdf.setFontSize(7.5);
  pdf.setTextColor(...GRIS);
  pdf.text(fecha, ancho - 14, 12, { align: "right" });
  pdf.setTextColor(...NARANJA_SUAVE);
  pdf.text("by @gastycoriaok", ancho - 14, 17, { align: "right" });

  // Línea separadora
  pdf.setDrawColor(30, 30, 30);
  pdf.setLineWidth(0.5);
  pdf.line(14, 22, ancho - 14, 22);

  y = 32;

  // ─── Nombre del cliente ──────────────────────────────────
  pdf.setTextColor(...BLANCO);
  pdf.setFontSize(20);
  pdf.setFont("helvetica", "bold");
  pdf.text(`${cliente.firstName} ${cliente.lastName}`, 14, y);
  y += 7;

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...GRIS_CLARO);
  pdf.text(`${cliente.age} años  ·  ${cliente.weight} kg  ·  ${cliente.height} cm  ·  ${cliente.objetivo}`, 14, y);
  y += 12;

  // ─── Nivel general ───────────────────────────────────────
  const nivel    = evaluacion.nivelGeneral || "principiante";
  const colorNiv = colorNivel(nivel);

  pdf.setFillColor(...FONDO_CARD);
  pdf.roundedRect(14, y, ancho - 28, 20, 3, 3, "F");

  // Barra izquierda de color
  pdf.setFillColor(...colorNiv);
  pdf.roundedRect(14, y, 3, 20, 1, 1, "F");

  pdf.setTextColor(...GRIS);
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.text("NIVEL GENERAL", 22, y + 7);

  pdf.setTextColor(...colorNiv);
  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.text(NIVEL_LABELS[nivel] || "Principiante", 22, y + 16);

  y += 27;

  // ─── Métricas ────────────────────────────────────────────
  seccionLabel(pdf, "MÉTRICAS CORPORALES", y);
  y += 5;

  const metricas = [
    { label: "IMC",         val: String(evaluacion.imc || "-") },
    { label: "FRECUENCIA",  val: `${evaluacion.frecuencia} días/sem` },
    { label: "EXPERIENCIA", val: cliente.experiencia },
  ];

  const anchoM = (ancho - 32) / 3;
  metricas.forEach((m, i) => {
    const x = 14 + i * (anchoM + 2);
    pdf.setFillColor(...FONDO_CARD);
    pdf.roundedRect(x, y, anchoM, 17, 2, 2, "F");
    pdf.setTextColor(...GRIS);
    pdf.setFontSize(7);
    pdf.setFont("helvetica", "normal");
    pdf.text(m.label, x + 4, y + 6);
    pdf.setTextColor(...BLANCO);
    pdf.setFontSize(11);
    pdf.setFont("helvetica", "bold");
    pdf.text(m.val, x + 4, y + 14);
  });

  y += 24;

  // ─── Tests de fuerza ─────────────────────────────────────
  seccionLabel(pdf, "TESTS DE FUERZA", y);
  y += 5;

  const esGimnasio = evaluacion.esGimnasio;
  const tests = esGimnasio ? [
    { label: "Press de banca",       val: evaluacion.banca         ? `${evaluacion.banca} kg`         : "No registrado", nivel: evaluacion.nivelBanca },
    { label: "Sentadilla con barra", val: evaluacion.sentadillaGym ? `${evaluacion.sentadillaGym} kg` : "No registrado", nivel: evaluacion.nivelSentGym },
    { label: "Peso muerto",          val: evaluacion.pesoMuerto    ? `${evaluacion.pesoMuerto} kg`    : "No registrado", nivel: evaluacion.nivelPesoMuerto },
    { label: "Remo con barra",       val: evaluacion.remo          ? `${evaluacion.remo} kg`          : "No registrado", nivel: evaluacion.nivelRemo },
  ] : [
    { label: "Flexiones",                    val: `${evaluacion.flexiones} reps`,  nivel: evaluacion.nivelFlex },
    { label: "Sentadilla con peso corporal", val: `${evaluacion.sentadilla} reps`, nivel: evaluacion.nivelSent },
    { label: "Dominadas",                    val: `${evaluacion.dominadas} reps`,  nivel: evaluacion.nivelDom },
    { label: "Plancha",                      val: `${evaluacion.plancha} seg`,     nivel: evaluacion.nivelPlancha },
  ];

  tests.forEach((t, i) => {
    const bg = i % 2 === 0 ? FONDO_CARD2 : FONDO_CARD;
    pdf.setFillColor(...bg);
    pdf.roundedRect(14, y, ancho - 28, 11, 1, 1, "F");

    pdf.setTextColor(...BLANCO);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    pdf.text(t.label, 20, y + 8);

    pdf.setTextColor(...GRIS_CLARO);
    pdf.text(t.val, ancho / 2, y + 8);

    if (t.nivel) {
      const cn = colorNivel(t.nivel);
      pdf.setTextColor(...cn);
      pdf.setFont("helvetica", "bold");
      pdf.text(NIVEL_LABELS[t.nivel] || "-", ancho - 16, y + 8, { align: "right" });
    }

    y += 12;
  });

  y += 6;

  // ─── Lesiones ────────────────────────────────────────────
  if (cliente.lesiones) {
    seccionLabel(pdf, "LESIONES O LIMITACIONES", y);
    y += 5;

    pdf.setFillColor(...FONDO_CARD);
    pdf.roundedRect(14, y, ancho - 28, 14, 2, 2, "F");
    pdf.setTextColor(...GRIS_CLARO);
    pdf.setFontSize(9);
    pdf.setFont("helvetica", "normal");
    const textoLesion = pdf.splitTextToSize(cliente.lesiones, ancho - 36);
    pdf.text(textoLesion, 20, y + 6);
    y += 20;
  }

  // ─── Alertas ─────────────────────────────────────────────
  if (alertas && alertas.length > 0) {
    seccionLabel(pdf, "ALERTAS DE LESIONES", y);
    y += 5;

    alertas.forEach((alerta) => {
      pdf.setFillColor(40, 15, 15);
      pdf.roundedRect(14, y, ancho - 28, 9, 2, 2, "F");
      pdf.setFillColor(160, 40, 40);
      pdf.roundedRect(14, y, 3, 9, 1, 1, "F");
      pdf.setTextColor(210, 70, 70);
      pdf.setFontSize(8);
      pdf.setFont("helvetica", "bold");
      pdf.text(alerta.zona.toUpperCase(), 21, y + 6);
      y += 12;

      alerta.ejercicios.forEach((ej) => {
        pdf.setTextColor(200, 70, 70);
        pdf.setFontSize(8.5);
        pdf.setFont("helvetica", "bold");
        pdf.text(ej.ejercicio, 18, y);
        y += 5;

        pdf.setTextColor(...GRIS_CLARO);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8.5);
        const lineas = pdf.splitTextToSize(ej.alerta, ancho - 36);
        pdf.text(lineas, 18, y);
        y += lineas.length * 5 + 4;
      });

      y += 3;
    });
  }

  // ─── Footer ──────────────────────────────────────────────
  // Línea naranja delgada abajo
  pdf.setFillColor(...NARANJA);
  pdf.rect(0, 290, ancho, 1.5, "F");

  pdf.setTextColor(...GRIS);
  pdf.setFontSize(7.5);
  pdf.setFont("helvetica", "normal");
  pdf.text("FitEval  ·  No hay excusas, hay datos.  ·  by @gastycoriaok", ancho / 2, 295, { align: "center" });

  // ─── Guardar ─────────────────────────────────────────────
  const nombreArchivo = `FitEval_${cliente.firstName}_${cliente.lastName}.pdf`;
  pdf.save(nombreArchivo);
}