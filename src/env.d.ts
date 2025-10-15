/// <reference path="../.astro/types.d.ts" />

interface Window {
  Twitch?: {
    Embed: new (
      elementId: string,
      options: {
        width: string | number;
        height: string | number;
        channel: string;
        parent: string[];
      }
    ) => void;
  };
}
