import { spawn } from "./spawn.js";
import { type Storage } from "./storage.js";
import { ThemeService } from "./theme.js";

export class ThemeSwitcherFactory {
  storage: typeof Storage;

  constructor(storage: typeof Storage) {
    this.storage = storage;
  }

  create() {
    const st = this.storage;
    return class ThemeSwitcher extends HTMLElement {
      storage = st;
      themeService = new ThemeService(this.storage);

      constructor() {
        super();
        const root = this.attachShadow({ mode: "open" });
        const style = document.createElement("link");
        style.rel = "stylesheet";
        style.href = "/themeSwitcher.css";
        root.appendChild(style);

        const switcher = document.createElement("div");
        switcher.classList.add("theme-switch");

        const themeImg = document.createElement("img");
        switcher.appendChild(themeImg);

        spawn(async () => {
          const theme = await this.themeService.get();
          document.documentElement.dataset.theme = theme.id;
          themeImg.classList.add("theme-switch__img");
          themeImg.src = "./icons/" + theme.img;
        });

        this.storage.subscribe(async (changes) => {
          if (changes.theme) {
            const theme = await this.themeService.get();
            document.documentElement.dataset.theme = theme.id;
            themeImg.src = "./icons/" + theme.img;
          }
        });

        switcher.addEventListener("click", async () => {
          const nt =
            (await this.themeService.get()).id === "day" ? "night" : "day";
          this.themeService.set(nt);
          const theme = await this.themeService.get();
          themeImg.src = "./icons/" + theme.img;
        });

        root.appendChild(switcher);
      }
    };
  }
}
