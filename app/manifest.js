export default function manifest() {
  return {
    name: "FitEval",
    short_name: "FitEval",
    description: "No hay excusas, hay datos.",
    start_url: "/clients",
    display: "standalone",
    background_color: "#0A0A0A",
    theme_color: "#FF6B1A",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/fiteval-logo192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/fiteval-logo512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}