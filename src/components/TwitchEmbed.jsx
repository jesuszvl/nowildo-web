import { useEffect, useRef, useState } from "preact/hooks";

export default function TwitchEmbed({ channel, width = "100%", height = 480 }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Lazy loading: solo cargar cuando el componente es visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { rootMargin: "50px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || !ref.current) return;

    let embedInstance = null;
    let scriptElement = null;

    // Función para crear el embed
    function createEmbed() {
      if (!ref.current) return;

      const parent = window.location.hostname;

      if (!window.Twitch || !window.Twitch.Embed) {
        console.warn("Twitch embed script not loaded yet");
        setError("El script de Twitch no se ha cargado correctamente");
        setLoading(false);
        return;
      }

      try {
        // Calcular altura: si es un número, usarlo; si es string con %, usar 100%; sino usar 100%
        const embedHeight =
          typeof height === "number"
            ? height
            : typeof height === "string" && height.includes("%")
              ? "100%"
              : parseInt(height) || "100%";

        embedInstance = new window.Twitch.Embed(ref.current.id, {
          width: "100%",
          height: embedHeight,
          channel,
          parent: [parent],
          autoplay: false,
        });

        // Función para aplicar estilos al iframe
        const applyIframeStyles = () => {
          const iframe = ref.current?.querySelector("iframe");
          if (iframe) {
            iframe.style.width = "100%";
            iframe.style.maxWidth = "100%";
            iframe.style.height = "100%";
            iframe.style.minHeight = "100%";
            iframe.style.display = "block";
            iframe.style.position = "absolute";
            iframe.style.top = "0";
            iframe.style.left = "0";
          }
          // También asegurar que el contenedor tenga altura
          if (ref.current) {
            ref.current.style.height = "100%";
            ref.current.style.minHeight =
              typeof height === "number" ? `${height}px` : "100%";
            ref.current.style.position = "relative";
          }
        };

        // Escuchar eventos del embed
        embedInstance.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          setLoading(false);
          setError(null);
          // Aplicar estilos al iframe cuando esté listo
          applyIframeStyles();
          // También aplicar después de un pequeño delay por si acaso
          setTimeout(applyIframeStyles, 100);
          setTimeout(applyIframeStyles, 500);
        });

        // Aplicar estilos inmediatamente después de crear el embed
        setTimeout(applyIframeStyles, 50);

        embedInstance.addEventListener(window.Twitch.Embed.ERROR, (error) => {
          console.error("TwitchEmbed: embed error", error);
          setError("Error al cargar el stream de Twitch");
          setLoading(false);
        });

        // Timeout de seguridad
        setTimeout(() => {
          if (loading) {
            setLoading(false);
          }
        }, 10000);
      } catch (err) {
        console.error("TwitchEmbed: failed to create embed", err);
        setError("Error al inicializar el reproductor de Twitch");
        setLoading(false);
      }
    }

    // Cargar el script de Twitch si no está disponible
    if (!window.Twitch) {
      scriptElement = document.createElement("script");
      scriptElement.src = "https://player.twitch.tv/js/embed/v1.js";
      scriptElement.async = true;
      scriptElement.onload = () => {
        createEmbed();
      };
      scriptElement.onerror = () => {
        console.error("TwitchEmbed: failed to load Twitch embed script");
        setError(
          "No se pudo cargar el reproductor de Twitch. Verifica tu conexión a internet."
        );
        setLoading(false);
      };
      document.body.appendChild(scriptElement);
    } else {
      createEmbed();
    }

    // Cleanup
    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      if (ref.current) {
        ref.current.innerHTML = "";
      }
      embedInstance = null;
    };
  }, [channel, width, height, isVisible, loading]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        maxWidth: "100%",
        position: "relative",
        height: typeof height === "number" ? `${height}px` : "100%",
        minHeight: typeof height === "number" ? `${height}px` : "100%",
      }}
    >
      {loading && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#18181b",
            color: "#efeff1",
            zIndex: 10,
            minHeight: typeof height === "number" ? `${height}px` : height,
          }}
        >
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #9147ff",
                borderTop: "4px solid transparent",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 16px",
              }}
            />
            <p>Cargando stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#18181b",
            color: "#efeff1",
            zIndex: 10,
            minHeight: typeof height === "number" ? `${height}px` : height,
            padding: "20px",
            textAlign: "center",
          }}
        >
          <div>
            <p style={{ marginBottom: "12px", fontSize: "18px" }}>⚠️ {error}</p>
            <a
              href={`https://www.twitch.tv/${channel}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "#9147ff",
                textDecoration: "underline",
              }}
            >
              Ver en Twitch
            </a>
          </div>
        </div>
      )}

      <div
        id={`twitch-embed-${channel}`}
        ref={ref}
        className="twitch-embed-container"
        style={{
          width: "100%",
          maxWidth: "100%",
          height: "100%",
          minHeight: typeof height === "number" ? `${height}px` : "100%",
          display: error ? "none" : "block",
          position: "relative",
        }}
      />
    </div>
  );
}
