import { useEffect, useRef, useState } from "preact/hooks";

interface TwitchEmbedProps {
  channel: string;
  width?: string | number;
  height?: string | number;
}

interface TwitchWindow extends Window {
  Twitch?: {
    Embed: {
      new (id: string, options: TwitchEmbedOptions): TwitchEmbedInstance;
      VIDEO_READY: string;
      ERROR: string;
    };
  };
}

interface TwitchEmbedOptions {
  width: string | number;
  height: string | number;
  channel: string;
  parent: string[];
  autoplay?: boolean;
}

interface TwitchEmbedInstance {
  addEventListener: (event: string, callback: () => void) => void;
}

export default function TwitchEmbed({
  channel,
  width = "100%",
  height = 480,
}: TwitchEmbedProps) {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const loadingTimeoutRef = useRef<number | null>(null);

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

    let embedInstance: TwitchEmbedInstance | null = null;
    let scriptElement: HTMLScriptElement | null = null;

    // Función para crear el embed
    function createEmbed() {
      if (!ref.current) return;

      const parent = window.location.hostname;
      const twitchWindow = window as TwitchWindow;

      if (!twitchWindow.Twitch || !twitchWindow.Twitch.Embed) {
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
              : parseInt(String(height)) || "100%";

        embedInstance = new twitchWindow.Twitch.Embed(ref.current.id, {
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
        embedInstance.addEventListener(twitchWindow.Twitch.Embed.VIDEO_READY, () => {
          setLoading(false);
          setError(null);
          // Aplicar estilos al iframe cuando esté listo
          applyIframeStyles();
          // También aplicar después de un pequeño delay por si acaso
          setTimeout(applyIframeStyles, 100);
          setTimeout(applyIframeStyles, 500);
          
          // Limpiar timeout de seguridad
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        });

        // Aplicar estilos inmediatamente después de crear el embed
        setTimeout(applyIframeStyles, 50);

        embedInstance.addEventListener(twitchWindow.Twitch.Embed.ERROR, () => {
          console.error("TwitchEmbed: embed error");
          setError("Error al cargar el stream de Twitch");
          setLoading(false);
          
          // Limpiar timeout de seguridad
          if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current);
            loadingTimeoutRef.current = null;
          }
        });

        // Timeout de seguridad
        loadingTimeoutRef.current = window.setTimeout(() => {
          if (loading) {
            setLoading(false);
            loadingTimeoutRef.current = null;
          }
        }, 10000);
      } catch (err) {
        console.error("TwitchEmbed: failed to create embed", err);
        setError("Error al inicializar el reproductor de Twitch");
        setLoading(false);
      }
    }

    // Cargar el script de Twitch si no está disponible
    const twitchWindow = window as TwitchWindow;
    if (!twitchWindow.Twitch) {
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
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
      if (ref.current) {
        ref.current.innerHTML = "";
      }
      embedInstance = null;
    };
  }, [channel, width, height, isVisible, loading]);

  const getHeightStyle = () => {
    return typeof height === "number" ? `${height}px` : "100%";
  };

  return (
    <div
      ref={containerRef}
      className="twitch-embed-wrapper"
      style={{
        height: getHeightStyle(),
        minHeight: getHeightStyle(),
      }}
    >
      {loading && (
        <div
          className="twitch-embed-loading"
          style={{
            minHeight: getHeightStyle(),
          }}
          role="status"
          aria-live="polite"
          aria-label="Cargando stream de Twitch"
        >
          <div className="twitch-embed-loading-content">
            <div className="twitch-embed-spinner" aria-hidden="true" />
            <p>Cargando stream...</p>
          </div>
        </div>
      )}

      {error && (
        <div
          className="twitch-embed-error"
          style={{
            minHeight: getHeightStyle(),
          }}
          role="alert"
          aria-live="assertive"
        >
          <div className="twitch-embed-error-content">
            <p className="twitch-embed-error-message">⚠️ {error}</p>
            <a
              href={`https://www.twitch.tv/${channel}`}
              target="_blank"
              rel="noopener noreferrer"
              className="twitch-embed-error-link"
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
          height: "100%",
          minHeight: getHeightStyle(),
          display: error ? "none" : "block",
        }}
      />
    </div>
  );
}

