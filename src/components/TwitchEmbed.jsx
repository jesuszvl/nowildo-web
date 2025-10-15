import { useEffect, useRef } from "preact/hooks";

export default function TwitchEmbed({ channel, width = "100%", height = 480 }) {
  const ref = useRef(null);

  useEffect(() => {
    // Cargar el script de Twitch si no está
    function createEmbed() {
      const parent = window.location.hostname;
      if (!window.Twitch || !window.Twitch.Embed) {
        console.warn("Twitch embed script not loaded yet");
        return;
      }
      try {
        new window.Twitch.Embed(ref.current.id, {
          width,
          height,
          channel,
          parent: [parent],
        });
      } catch (err) {
        console.error("TwitchEmbed: failed to create embed", err);
      }
    }

    if (!window.Twitch) {
      const s = document.createElement("script");
      s.src = "https://player.twitch.tv/js/embed/v1.js";
      s.async = true;
      s.onload = createEmbed;
      s.onerror = () =>
        console.error("TwitchEmbed: failed to load Twitch embed script");
      document.body.appendChild(s);
    } else {
      createEmbed();
    }

    // cleanup si se necesita
    return () => {
      if (ref.current) ref.current.innerHTML = "";
    };
  }, [channel, width, height]);

  return (
    <div
      id={`twitch-embed-${channel}`}
      ref={ref}
      style={{ width: "100%", maxWidth: "100%" }}
    />
  );
}
