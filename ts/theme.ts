import { ThemeType, ThemeLabelType } from "./themeType.js";
import { Storage } from "./storage.js";

export const Themes: { [P in ThemeLabelType]: ThemeType } = {
  day: {
    id: "day",
    img: "moon.svg",
  },
  night: {
    id: "night",
    img: "sun.svg",
  },
};

export const getTheme = async (): Promise<ThemeType> => {
  return Themes[await Storage.get("theme")];
};

let switchCounter = 0;

export const setTheme = async (themeName: ThemeLabelType) => {
  Storage.set("theme", themeName);
  document.documentElement.classList.add("switch-transition");
  ++switchCounter;
  setTimeout(() => {
    document.documentElement.dataset.theme = themeName;
  }, 10);
  setTimeout(() => {
    --switchCounter;
    if (switchCounter < 1) {
      document.documentElement.classList.remove("switch-transition");
    }
  }, 1500);
};
