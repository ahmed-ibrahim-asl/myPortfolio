export const THEME_STORAGE_KEY = "asl-theme-preference";

export function normalizeTheme(value) {
  return value === "light" ? "light" : "dark";
}

export const themeInitializerScript = `(() => {
  let theme = "dark";
  try {
    const savedTheme = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (savedTheme === "light" || savedTheme === "dark") theme = savedTheme;
  } catch {}
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
})();`;
