declare namespace UnityLoader {
  export class Game {
    public popup(
      text: string,
      buttons: { text: string; callback: () => void }[]
    ): void;
  }
  export function instantiate(
    container: HTMLElement | string,
    url: string,
    override?: {
      [k: string]: unknown;
      compatibilityCheck?: (
        gameInstance: Game,
        onsuccess: () => void,
        onerror: () => void
      ) => void;
      onProgress?: (g: Game, p: number) => void;
    }
  ): Game;

  export const SystemInfo: {
    hasWebGL: boolean;
    mobile: boolean;
    browser: string;
  };
}
