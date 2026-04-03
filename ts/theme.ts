import { ThemeType, ThemeLabelType } from "./themeType.js";
import { type Storage } from "./storage.js";

const Themes: { [P in ThemeLabelType]: ThemeType } = {
  day: {
    id: "day",
    img: "moon.svg",
  },
  night: {
    id: "night",
    img: "sun.svg",
  },
};

export class ThemeService {
  storage: typeof Storage;
  switchCounter = 0;

  constructor(storage: typeof Storage) {
    this.storage = storage;
  }

  async get(): Promise<ThemeType> {
    return Themes[await this.storage.get("theme")];
  }

  async set(themeName: ThemeLabelType) {
    this.storage.set("theme", themeName);
    document.documentElement.classList.add("switch-transition");
    ++this.switchCounter;
    setTimeout(() => {
      document.documentElement.dataset.theme = themeName;
    }, 10);
    setTimeout(() => {
      --this.switchCounter;
      if (this.switchCounter < 1) {
        document.documentElement.classList.remove("switch-transition");
      }
    }, 1500);
  }
}
