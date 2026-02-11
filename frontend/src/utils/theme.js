export const initTheme = () => {
  const theme = localStorage.getItem("theme");
  if (theme === "dark") {
    document.documentElement.setAttribute("data-theme", "dark");
  }
};

export const toggleTheme = () => {
  const html = document.documentElement;
  const isDark = html.getAttribute("data-theme") === "dark";

  if (isDark) {
    html.removeAttribute("data-theme");
    localStorage.setItem("theme", "light");
  } else {
    html.setAttribute("data-theme", "dark");
    localStorage.setItem("theme", "dark");
  }
};
