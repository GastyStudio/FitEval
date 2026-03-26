"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Header from "./Header";
import { generarAlertas } from "@/lib/alertas";
import { generarPDF } from "@/lib/generarPDF";

const DAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

const FREQ_CONFIG = {
  3: { active: [0, 2, 4], note: "Ideal para principiantes. Permite recuperación completa entre sesiones." },
  4: { active: [0, 1, 3, 4], note: "Buen balance entre volumen y recuperación. Recomendado para hipertrofia." },
  5: { active: [0, 1, 2, 3, 4], note: "Alto volumen semanal. Asegurate de que el descanso nocturno sea suficiente." },
};

const NIVEL_ESTILOS = {
  principiante: { badge: { background: "rgba(24,95,165,0.12)", color: "#4A8FCC", border: "1px solid rgba(24,95,165,0.2)" }, texto: { color: "#4A8FCC" } },
  intermedio:   { badge: { background: "rgba(186,117,23,0.12)", color: "#D4973A", border: "1px solid rgba(186,117,23,0.2)" }, texto: { color: "#D4973A" } },
  avanzado:     { badge: { background: "rgba(59,109,17,0.12)", color: "#6BB040", border: "1px solid rgba(59,109,17,0.2)" }, texto: { color: "#6BB040" } },
};

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio:   "Intermedio",
  avanzado:     "Avanzado",
};

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

export default function EvaluationResult() {
  const router  = useRouter();
  const params  = useParams();
  const [cliente, setCliente]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [freq, setFreq]         = useState(3);
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    fetch(`/api/clients/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCliente(data);
        const ev = data.evaluation || data["evaluación"];
        if (ev?.frecuencia) setFreq(ev.frecuencia);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params?.id]);

  if (loading) return (
    <div className="app-container" style={{ textAlign: "center", paddingTop: "4rem", color: "var(--texto-apagado)" }}>
      Cargando evaluación...
    </div>
  );

  if (!cliente) return (
    <div className="app-container" style={{ textAlign: "center", paddingTop: "4rem", color: "var(--texto-apagado)" }}>
      Cliente no encontrado.
    </div>
  );

  const ev          = cliente.evaluation || cliente["evaluación"];
  const nivel       = ev?.nivelGeneral || "principiante";
  const estilos     = NIVEL_ESTILOS[nivel];
  const cfg         = FREQ_CONFIG[freq];
  const esGimnasio  = ev?.esGimnasio;
  const alertas = generarAlertas(cliente.lesiones);

  // Tests según tipo de entrenamiento
  const tests = esGimnasio ? [
    { label: "Press de banca",       badge: "pecho",          val: ev?.banca         ? `${ev.banca} kg`         : "No registrado", nivel: ev?.nivelBanca },
    { label: "Sentadilla con barra", badge: "tren inferior",  val: ev?.sentadillaGym ? `${ev.sentadillaGym} kg` : "No registrado", nivel: ev?.nivelSentGym },
    { label: "Peso muerto",          badge: "posterior",      val: ev?.pesoMuerto    ? `${ev.pesoMuerto} kg`    : "No registrado", nivel: ev?.nivelPesoMuerto },
    { label: "Remo con barra",       badge: "espalda",        val: ev?.remo          ? `${ev.remo} kg`          : "No registrado", nivel: ev?.nivelRemo },
  ] : [
    { label: "Flexiones",                    badge: "empuje",   val: `${ev?.flexiones} reps`,  nivel: ev?.nivelFlex },
    { label: "Sentadilla con peso corporal", badge: "inferior", val: `${ev?.sentadilla} reps`, nivel: ev?.nivelSent },
    { label: "Dominadas",                    badge: "tirón",    val: `${ev?.dominadas} reps`,  nivel: ev?.nivelDom },
    { label: "Plancha",                      badge: "core",     val: `${ev?.plancha} seg`,     nivel: ev?.nivelPlancha },
  ];

  const metricas = [
    { label: "IMC",        val: ev?.imc || "-",              sub: "índice de masa corporal" },
    { label: "Frecuencia", val: `${ev?.frecuencia} días`,    sub: "por semana sugeridos"    },
    { label: "Experiencia", val: cliente.experiencia === "Sin experiencia" ? "0" : cliente.experiencia === "Menos de 1 año" ? "-1 año" : "+1 año", sub: "en entrenamiento" },
  ];

 async function descargarPDF() {
  setGenerando(true);
  await generarPDF(cliente, ev, alertas);
  setGenerando(false);
}

  return (
    <div className="app-container" id="informe-cliente" style={{ padding: "2rem", maxWidth: 600, margin: "0 auto" }}>
      <Header />

      {/* Header cliente */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: "2rem" }}>
        <div style={{
          width: 52, height: 52, borderRadius: "50%",
          background: "var(--naranja-suave)",
          border: "1px solid var(--naranja-borde)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--naranja)", fontWeight: 600, fontSize: 16, flexShrink: 0,
        }}>
          {getInitials(cliente.firstName, cliente.lastName)}
        </div>
        <div>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 3px", color: "var(--texto)" }}>
            {cliente.firstName} {cliente.lastName}
          </p>
          <p style={{ fontSize: 13, color: "var(--texto-secundario)", margin: 0 }}>
            {cliente.age} años · {cliente.weight} kg · {cliente.height} cm · {cliente.objetivo}
          </p>
        </div>
      </div>

      {/* Nivel general */}
      <p className="section-label">Nivel general</p>
      <div className="card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
        <div>
          <p style={{ fontSize: 12, color: "var(--texto-apagado)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Resultado de la evaluación
          </p>
          <p style={{ fontSize: 32, fontWeight: 600, margin: 0, ...estilos.texto }}>
            {NIVEL_LABELS[nivel]}
          </p>
        </div>
        <div style={{
          width: 58, height: 58, borderRadius: "50%",
          background: estilos.badge.background,
          border: estilos.badge.border,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 24,
        }}>
          💪
        </div>
      </div>

      <div className="divider" />

      {/* Métricas */}
      <p className="section-label">Métricas corporales</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1rem" }}>
        {metricas.map((m) => (
          <div key={m.label} className="card" style={{ padding: "0.9rem 1rem" }}>
            <p style={{ fontSize: 10, color: "var(--texto-apagado)", margin: "0 0 6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>{m.label}</p>
            <p style={{ fontSize: 20, fontWeight: 600, margin: "0 0 2px", color: "var(--texto)" }}>{m.val}</p>
            <p style={{ fontSize: 11, color: "var(--texto-apagado)", margin: 0 }}>{m.sub}</p>
          </div>
        ))}
      </div>

      <div className="divider" />
      {/* Alertas de lesiones */}
{alertas.length > 0 && (
  <>
    <p className="section-label">Alertas de lesiones</p>
    {alertas.map((alerta, i) => (
      <div
        key={i}
        style={{
          background: "rgba(220, 60, 60, 0.06)",
          border: "1px solid rgba(220, 60, 60, 0.2)",
          borderRadius: 12,
          padding: "1rem 1.25rem",
          marginBottom: 10,
        }}
      >
        {/* Zona afectada */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>{alerta.icono}</span>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#E05555", margin: 0 }}>
            {alerta.zona}
          </p>
        </div>

        {/* Ejercicios afectados */}
        {alerta.ejercicios.map((ej, j) => (
          <div
            key={j}
            style={{
              borderTop: j > 0 ? "1px solid rgba(220,60,60,0.1)" : "none",
              paddingTop: j > 0 ? 10 : 0,
              marginTop: j > 0 ? 10 : 0,
            }}
          >
            <p style={{ fontSize: 12, fontWeight: 600, color: "#E05555", margin: "0 0 4px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {ej.ejercicio}
            </p>
            <p style={{ fontSize: 13, color: "var(--texto-secundario)", margin: 0, lineHeight: 1.6 }}>
              {ej.alerta}
            </p>
          </div>
        ))}
      </div>
    ))}
    <div className="divider" />
  </>
)}

      {/* Tests */}
      <p className="section-label">Tests de fuerza</p>
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {tests.map((t, i) => {
          const ns = NIVEL_ESTILOS[t.nivel] || NIVEL_ESTILOS.principiante;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "0.9rem 1.25rem",
                borderBottom: i < tests.length - 1 ? "1px solid var(--borde)" : "none",
              }}
            >
              <div>
                <p style={{ fontSize: 14, color: "var(--texto)", margin: "0 0 3px" }}>{t.label}</p>
                <p style={{ fontSize: 12, color: "var(--texto-secundario)", margin: 0 }}>{t.val}</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4 }}>
                <span className="badge-referencia">{t.badge}</span>
                {t.nivel && (
                  <span style={{ ...ns.badge, fontSize: 11, padding: "2px 10px", borderRadius: 6, fontWeight: 500 }}>
                    {NIVEL_LABELS[t.nivel] || "Principiante"}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="divider" />

      {/* Frecuencia */}
      <p className="section-label">Frecuencia semanal sugerida</p>
      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        {[3, 4, 5].map((n) => (
          <button
            key={n}
            onClick={() => setFreq(n)}
            style={{
              padding: "6px 16px",
              borderRadius: 20,
              fontSize: 13,
              cursor: "pointer",
              border: "1px solid",
              borderColor: freq === n ? "var(--naranja)" : "var(--borde)",
              background: freq === n ? "var(--naranja-suave)" : "transparent",
              color: freq === n ? "var(--naranja)" : "var(--texto-secundario)",
              transition: "all 0.2s",
            }}
          >
            {n} días
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 6, marginBottom: "0.75rem" }}>
        {DAYS.map((d, i) => {
          const activo = cfg.active.includes(i);
          return (
            <div
              key={d}
              style={{
                borderRadius: 8,
                padding: "8px 4px",
                textAlign: "center",
                border: `1px solid ${activo ? "var(--naranja)" : "var(--borde)"}`,
                background: activo ? "var(--naranja-suave)" : "transparent",
                transition: "all 0.2s",
              }}
            >
              <span style={{ fontSize: 10, color: activo ? "var(--naranja)" : "var(--texto-apagado)", display: "block", marginBottom: 6 }}>{d}</span>
              <div style={{
                width: 6, height: 6, borderRadius: "50%",
                background: activo ? "var(--naranja)" : "var(--borde)",
                margin: "0 auto",
                boxShadow: activo ? "0 0 6px rgba(255,107,26,0.6)" : "none",
              }} />
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 13, color: "var(--texto-apagado)", marginBottom: "1.5rem" }}>{cfg.note}</p>

      {/* Acciones */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={() => router.push("/clients")} className="btn-secondary">
          Volver
        </button>
       <button
        onClick={descargarPDF}
        className="btn-primary"
        style={{ opacity: generando ? 0.7 : 1 }}
        disabled={generando}
      >
      {generando ? "Generando PDF..." : "Descargar PDF →"}
      </button>
      </div>

      <footer className="app-footer">
        <span className="footer-slogan">"No hay excusas, <span>hay datos.</span>"</span>
        <span className="footer-by">by @gastycoriaok</span>
      </footer>
    </div>
  );
}