"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";

const AVATAR_COLORS = [
  { bg: "#FF6B1A",            color: "#fff"    },
  { bg: "rgba(24,95,165,0.2)", color: "#4A8FCC" },
  { bg: "rgba(59,109,17,0.2)", color: "#6BB040" },
  { bg: "rgba(186,117,23,0.2)",color: "#D4973A" },
];

const NIVEL_ESTILOS = {
  principiante: { background: "rgba(24,95,165,0.12)",  color: "#4A8FCC",  border: "1px solid rgba(24,95,165,0.2)"  },
  intermedio:   { background: "rgba(186,117,23,0.12)", color: "#D4973A",  border: "1px solid rgba(186,117,23,0.2)" },
  avanzado:     { background: "rgba(59,109,17,0.12)",  color: "#6BB040",  border: "1px solid rgba(59,109,17,0.2)"  },
};

const NIVEL_LABELS = {
  principiante: "Principiante",
  intermedio:   "Intermedio",
  avanzado:     "Avanzado",
};

function getInitials(firstName, lastName) {
  return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase();
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Ayer";
  return date.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
}

export default function ClientList() {
  const router = useRouter();
  const [clientes, setClientes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [busqueda, setBusqueda]   = useState("");
  const [filtroNivel, setFiltroNivel] = useState("");

  useEffect(() => {
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setClientes(data);
        else setClientes([]);
        setLoading(false);
      })
      .catch(() => {
        setClientes([]);
        setLoading(false);
      });
  }, []);

  const clientesFiltrados = clientes.filter((c) => {
    const evaluacion   = c.evaluation || c["evaluación"];
    const nombreCompleto = `${c.firstName} ${c.lastName}`.toLowerCase();
    const coincideNombre = nombreCompleto.includes(busqueda.toLowerCase());
    const coincideNivel  = filtroNivel === "" || evaluacion?.nivelGeneral === filtroNivel;
    return coincideNombre && coincideNivel;
  });

  const esteMes   = clientes.filter((c) => Math.floor((new Date() - new Date(c.createdAt)) / 86400000) <= 30).length;
  const avanzados = clientes.filter((c) => (c.evaluation || c["evaluación"])?.nivelGeneral === "avanzado").length;

  return (
    <div className="app-container">
      <Header />

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: "1.5rem" }}>
        {[
          { label: "Total",     valor: clientes.length },
          { label: "Este mes",  valor: esteMes },
          { label: "Avanzados", valor: avanzados },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: "center", padding: "1rem 0.5rem" }}>
            <p style={{ fontSize: 11, color: "var(--texto-apagado)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.label}</p>
            <p style={{ fontSize: 26, fontWeight: 600, color: s.label === "Total" ? "var(--naranja)" : "var(--texto)" }}>{s.valor}</p>
          </div>
        ))}
      </div>

      {/* Buscar + filtro */}
      <div style={{ display: "flex", gap: 10, marginBottom: "1.25rem" }}>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="input-field"
          style={{ flex: 1 }}
        />
        <select
          value={filtroNivel}
          onChange={(e) => setFiltroNivel(e.target.value)}
          className="input-field"
          style={{ width: "auto", minWidth: 130 }}
        >
          <option value="">Todos</option>
          <option value="principiante">Principiante</option>
          <option value="intermedio">Intermedio</option>
          <option value="avanzado">Avanzado</option>
        </select>
      </div>

      {/* Botón nuevo */}
      <button
        onClick={() => router.push("/clients/nuevo")}
        className="btn-primary"
        style={{ marginBottom: "1.5rem" }}
      >
        + Nueva evaluación
      </button>

      {/* Lista */}
      {loading ? (
        <p style={{ textAlign: "center", color: "var(--texto-apagado)", padding: "3rem 0" }}>Cargando clientes...</p>
      ) : clientesFiltrados.length === 0 ? (
        <p style={{ textAlign: "center", color: "var(--texto-apagado)", padding: "3rem 0" }}>
          {clientes.length === 0 ? "Todavía no cargaste ningún cliente." : "No se encontraron resultados."}
        </p>
      ) : (
        clientesFiltrados.map((c, i) => {
          const evaluacion = c.evaluation || c["evaluación"];
          const nivel      = evaluacion?.nivelGeneral || "principiante";
          const av         = AVATAR_COLORS[i % AVATAR_COLORS.length];
          const ns         = NIVEL_ESTILOS[nivel];

          return (
            <div
              key={c.id}
              onClick={() => router.push(`/clients/${c.id}`)}
              className="card fade-up"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                marginBottom: 8,
                cursor: "pointer",
                transition: "border-color 0.2s",
                animationDelay: `${i * 0.05}s`,
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = "var(--borde-hover)"}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = "var(--borde)"}
            >
              {/* Avatar */}
              <div style={{
                width: 42, height: 42, borderRadius: "50%",
                background: av.bg, color: av.color,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600, flexShrink: 0,
              }}>
                {getInitials(c.firstName, c.lastName)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 500, margin: "0 0 3px", color: "var(--texto)" }}>
                  {c.firstName} {c.lastName}
                </p>
                <p style={{ fontSize: 12, color: "var(--texto-secundario)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.age} años · {c.weight} kg · {c.objetivo}
                </p>
              </div>

              {/* Badge + fecha */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 4, flexShrink: 0 }}>
                <span style={{ ...ns, fontSize: 11, padding: "3px 10px", borderRadius: 6, fontWeight: 500 }}>
                  {NIVEL_LABELS[nivel]}
                </span>
                <span style={{ fontSize: 11, color: "var(--texto-apagado)" }}>
                  {formatDate(c.createdAt)}
                </span>
              </div>
            </div>
          );
        })
      )}

      {/* Footer */}
      <footer className="app-footer">
        <span className="footer-slogan">"No hay excusas, <span>hay datos.</span>"</span>
        <span className="footer-by">by @gastycoriaok</span>
      </footer>
    </div>
  );
}