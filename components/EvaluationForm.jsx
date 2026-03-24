"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";

const OBJETIVOS   = ["Hipertrofia", "Fuerza", "Bajar peso", "Rendimiento", "Salud general"];
const EXPERIENCIAS = ["Sin experiencia", "Menos de 1 año", "Más de 1 año"];

const UMBRALES_CUERPO = {
  flexiones:  [10, 20],
  sentadilla: [15, 30],
  dominadas:  [3, 8],
  plancha:    [30, 60],
};

const UMBRALES_GYM = {
  banca:         [0.5, 1.0],
  sentadillaGym: [0.75, 1.25],
  pesoMuerto:    [1.0, 1.5],
  remo:          [0.5, 1.0],
};

function calcularNivel(valor, umbrales) {
  if (valor >= umbrales[1]) return "avanzado";
  if (valor >= umbrales[0]) return "intermedio";
  return "principiante";
}

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio:   "Intermedio",
  avanzado:     "Avanzado",
};

function nivelDesdeRatio(kg, peso, umbral) {
  if (!kg || !peso) return null;
  const ratio = parseFloat(kg) / parseFloat(peso);
  return calcularNivel(ratio, umbral);
}

function calcularNivelGeneral(niveles) {
  const validos = niveles.filter(Boolean);
  if (validos.length === 0) return "principiante";
  const cuenta = { avanzado: 0, intermedio: 0, principiante: 0 };
  validos.forEach((n) => cuenta[n]++);
  if (cuenta.avanzado > validos.length / 2)   return "avanzado";
  if (cuenta.intermedio > validos.length / 2) return "intermedio";
  if (cuenta.avanzado >= 1)                   return "intermedio";
  return "principiante";
}

export default function EvaluationForm() {
  const router = useRouter();

  const [form, setForm] = useState({
    firstName: "", lastName: "", age: "", sex: "",
    weight: "", height: "", objetivo: "", experiencia: "",
    esGimnasio: null,
    flexiones: "", sentadilla: "", dominadas: "", plancha: "",
    banca: "", sentadillaGym: "", pesoMuerto: "", remo: "",
    lesiones: "",
  });

  function set(campo, valor) {
    setForm((prev) => ({ ...prev, [campo]: valor }));
  }

  const progreso = Math.min(
    Math.round((Object.values(form).filter((v) => v !== "" && v !== null).length / Object.keys(form).length) * 100),
    100
  );

  // Niveles cuerpo
  const nivelFlexiones  = form.flexiones  ? calcularNivel(+form.flexiones,  UMBRALES_CUERPO.flexiones)  : null;
  const nivelSentadilla = form.sentadilla ? calcularNivel(+form.sentadilla, UMBRALES_CUERPO.sentadilla) : null;
  const nivelDominadas  = form.dominadas  ? calcularNivel(+form.dominadas,  UMBRALES_CUERPO.dominadas)  : null;
  const nivelPlancha    = form.plancha    ? calcularNivel(+form.plancha,    UMBRALES_CUERPO.plancha)    : null;

  // Niveles gimnasio
  const nivelBanca         = nivelDesdeRatio(form.banca,         form.weight, UMBRALES_GYM.banca);
  const nivelSentadillaGym = nivelDesdeRatio(form.sentadillaGym, form.weight, UMBRALES_GYM.sentadillaGym);
  const nivelPesoMuerto    = nivelDesdeRatio(form.pesoMuerto,    form.weight, UMBRALES_GYM.pesoMuerto);
  const nivelRemo          = nivelDesdeRatio(form.remo,          form.weight, UMBRALES_GYM.remo);

  async function guardarCliente() {
    const alturaMetros = parseFloat(form.height) / 100;
    const imc = (parseFloat(form.weight) / (alturaMetros * alturaMetros)).toFixed(1);

    let frecuencia = 3;
    if (form.experiencia === "Menos de 1 año") frecuencia = 4;
    if (form.experiencia === "Más de 1 año")   frecuencia = 5;

    const nivelGeneral = form.esGimnasio
      ? calcularNivelGeneral([nivelBanca, nivelSentadillaGym, nivelPesoMuerto, nivelRemo])
      : calcularNivelGeneral([nivelFlexiones, nivelSentadilla, nivelDominadas, nivelPlancha]);

    const datos = {
      ...form,
      nivelFlex:       nivelFlexiones      || "principiante",
      nivelSent:       nivelSentadilla     || "principiante",
      nivelDom:        nivelDominadas      || "principiante",
      nivelPlancha:    nivelPlancha        || "principiante",
      nivelBanca:      nivelBanca          || null,
      nivelSentGym:    nivelSentadillaGym  || null,
      nivelPesoMuerto: nivelPesoMuerto     || null,
      nivelRemo:       nivelRemo           || null,
      nivelGeneral,
      imc,
      frecuencia,
    };

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos),
      });
      const clienteGuardado = await res.json();
      if (!res.ok) throw new Error(clienteGuardado.error);
      router.push(`/clients/${clienteGuardado.id}`);
    } catch (error) {
      console.error("Error al guardar cliente:", error);
      alert("Hubo un error al guardar. Revisá la consola.");
    }
  }

  return (
    <div className="app-container">
      <Header />

      {/* Barra de progreso */}
      <div style={{ marginBottom: "2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ fontSize: 11, color: "var(--texto-apagado)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Progreso</span>
          <span style={{ fontSize: 11, color: "var(--naranja)", fontWeight: 500 }}>{progreso}%</span>
        </div>
        <div style={{ height: 2, background: "var(--borde)", borderRadius: 2, position: "relative" }}>
          <div style={{
            height: "100%",
            width: `${progreso}%`,
            background: "linear-gradient(90deg, #FF6B1A, #FF9A5C)",
            borderRadius: 2,
            transition: "width 0.3s",
            position: "relative",
          }}>
            {progreso > 5 && (
              <div style={{
                position: "absolute", right: 0, top: "50%",
                transform: "translateY(-50%)",
                width: 7, height: 7, borderRadius: "50%",
                background: "#FF6B1A",
                boxShadow: "0 0 8px rgba(255,107,26,0.8)",
              }} />
            )}
          </div>
        </div>
      </div>

      {/* Datos personales */}
      <p className="section-label">Datos personales</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Campo label="Nombre">
          <input className="input-field" type="text" placeholder="Ej: Lucía" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} />
        </Campo>
        <Campo label="Apellido">
          <input className="input-field" type="text" placeholder="Ej: Torres" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </Campo>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Campo label="Edad">
          <input className="input-field" type="number" placeholder="25" value={form.age} onChange={(e) => set("age", e.target.value)} />
        </Campo>
        <Campo label="Sexo biológico">
          <select className="input-field" value={form.sex} onChange={(e) => set("sex", e.target.value)}>
            <option value="">Seleccionar</option>
            <option>Masculino</option>
            <option>Femenino</option>
          </select>
        </Campo>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
        <Campo label="Peso (kg)">
          <input className="input-field" type="number" placeholder="75" value={form.weight} onChange={(e) => set("weight", e.target.value)} />
        </Campo>
        <Campo label="Altura (cm)">
          <input className="input-field" type="number" placeholder="175" value={form.height} onChange={(e) => set("height", e.target.value)} />
        </Campo>
      </div>

      <div className="divider" />

      {/* Objetivo */}
      <p className="section-label">Objetivo principal</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {OBJETIVOS.map((op) => (
          <button key={op} onClick={() => set("objetivo", op)}
            className={`chip ${form.objetivo === op ? "activo" : ""}`}>
            {op}
          </button>
        ))}
      </div>

      {/* Experiencia */}
      <p className="section-label">Experiencia</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {EXPERIENCIAS.map((op) => (
          <button key={op} onClick={() => set("experiencia", op)}
            className={`chip ${form.experiencia === op ? "activo" : ""}`}>
            {op}
          </button>
        ))}
      </div>

      <div className="divider" />

      {/* Tipo de entrenamiento */}
      <p className="section-label">¿Dónde entrena tu cliente?</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: "1rem" }}>
        {[
          { label: "Calistenia / exterior", icono: "🏃", val: false },
          { label: "Gimnasio con pesas",    icono: "🏋️", val: true  },
        ].map((op) => (
          <button
            key={String(op.val)}
            onClick={() => set("esGimnasio", op.val)}
            style={{
              padding: "1.1rem",
              borderRadius: 12,
              border: "1px solid",
              borderColor: form.esGimnasio === op.val ? "var(--naranja)" : "var(--borde)",
              background: form.esGimnasio === op.val ? "var(--naranja-suave)" : "var(--fondo-card)",
              color: form.esGimnasio === op.val ? "var(--naranja)" : "var(--texto-secundario)",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 0.2s",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {form.esGimnasio === op.val && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: "var(--naranja)" }} />
            )}
            <span style={{ fontSize: 20, display: "block", marginBottom: 6 }}>{op.icono}</span>
            <span style={{ fontSize: 13 }}>{op.label}</span>
          </button>
        ))}
      </div>

      {/* Tests cuerpo */}
      {form.esGimnasio === false && (
        <>
          <p className="section-label">Tests de fuerza — peso corporal</p>
          <TarjetaTest label="Flexiones"                    badge="empuje horizontal" unidad="reps" valor={form.flexiones}  onChange={(v) => set("flexiones", v)}  nivel={nivelFlexiones} />
          <TarjetaTest label="Sentadilla con peso corporal" badge="tren inferior"     unidad="reps" valor={form.sentadilla} onChange={(v) => set("sentadilla", v)} nivel={nivelSentadilla} />
          <TarjetaTest label="Dominadas"                    badge="tirón vertical"    unidad="reps" valor={form.dominadas}  onChange={(v) => set("dominadas", v)}  nivel={nivelDominadas}
            nota="Si no puede hacer dominadas, registrar 0 y usar remo invertido." />
          <TarjetaTest label="Plancha"                      badge="core"              unidad="seg"  valor={form.plancha}    onChange={(v) => set("plancha", v)}    nivel={nivelPlancha} />
        </>
      )}

      {/* Tests gimnasio */}
      {form.esGimnasio === true && (
        <>
          <p className="section-label">Tests de fuerza — gimnasio</p>
          <p style={{ fontSize: 12, color: "var(--texto-apagado)", marginBottom: 14 }}>
            Peso máximo en una repetición. Dejá en blanco si no hace el ejercicio.
          </p>
          <TarjetaTest label="Press de banca"    badge="pecho"          unidad="kg" valor={form.banca}         onChange={(v) => set("banca", v)}         nivel={nivelBanca}         pesoCorporal={form.weight} />
          <TarjetaTest label="Sentadilla con barra" badge="tren inferior" unidad="kg" valor={form.sentadillaGym} onChange={(v) => set("sentadillaGym", v)} nivel={nivelSentadillaGym} pesoCorporal={form.weight} />
          <TarjetaTest label="Peso muerto"       badge="posterior"      unidad="kg" valor={form.pesoMuerto}    onChange={(v) => set("pesoMuerto", v)}    nivel={nivelPesoMuerto}    pesoCorporal={form.weight} />
          <TarjetaTest label="Remo con barra"    badge="espalda"        unidad="kg" valor={form.remo}          onChange={(v) => set("remo", v)}          nivel={nivelRemo}          pesoCorporal={form.weight} />
        </>
      )}

      <div className="divider" />

      {/* Lesiones */}
      <p className="section-label">Lesiones o limitaciones</p>
      <textarea
        className="input-field"
        placeholder="Ej: dolor lumbar crónico, molestia en rodilla..."
        value={form.lesiones}
        onChange={(e) => set("lesiones", e.target.value)}
        style={{ minHeight: 80, resize: "vertical" }}
      />

      {/* Botones */}
      <div style={{ display: "flex", gap: 10, marginTop: "2rem" }}>
        <button onClick={() => router.push("/clients")} className="btn-secondary">
          Cancelar
        </button>
        <button onClick={guardarCliente} className="btn-primary">
          Generar informe →
        </button>
      </div>

      <footer className="app-footer">
        <span className="footer-slogan">"No hay excusas, <span>hay datos.</span>"</span>
        <span className="footer-by">by @gastycoriaok</span>
      </footer>
    </div>
  );
}

// ─── Subcomponentes ───────────────────────────────────────

function Campo({ label, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 11, color: "var(--texto-apagado)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</label>
      {children}
    </div>
  );
}

function TarjetaTest({ label, badge, unidad, valor, onChange, nivel, nota, pesoCorporal }) {
  const ratio = pesoCorporal && valor
    ? (parseFloat(valor) / parseFloat(pesoCorporal)).toFixed(2)
    : null;

  const estilosNivel = {
    principiante: { background: "rgba(24,95,165,0.12)",  color: "#4A8FCC",  border: "1px solid rgba(24,95,165,0.2)"  },
    intermedio:   { background: "rgba(186,117,23,0.12)", color: "#D4973A",  border: "1px solid rgba(186,117,23,0.2)" },
    avanzado:     { background: "rgba(59,109,17,0.12)",  color: "#6BB040",  border: "1px solid rgba(59,109,17,0.2)"  },
  };

  return (
    <div className="card" style={{ marginBottom: 8, transition: "border-color 0.2s" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 14, color: "var(--texto)" }}>{label}</span>
        <span className="badge-referencia">{badge}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <input
          type="number"
          placeholder="0"
          min="0"
          value={valor}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 12, color: "var(--texto-apagado)", minWidth: 28, textTransform: "uppercase", letterSpacing: "0.06em" }}>{unidad}</span>
      </div>
      {ratio && (
        <p style={{ fontSize: 11, color: "var(--texto-apagado)", marginTop: 6, letterSpacing: "0.02em" }}>
          Ratio: {ratio}x tu peso corporal
        </p>
      )}
      {nivel && (
        <span style={{ ...estilosNivel[nivel], fontSize: 11, padding: "3px 12px", borderRadius: 6, fontWeight: 500, display: "inline-block", marginTop: 8 }}>
          {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
        </span>
      )}
      {nota && <p style={{ fontSize: 12, color: "var(--texto-apagado)", marginTop: 6 }}>{nota}</p>}
    </div>
  );
}