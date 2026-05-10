export type Theme = 'dark' | 'light';

export function getTheme(): Theme {
  return (localStorage.getItem('lb_theme') as Theme) ?? 'dark';
}

export function setTheme(theme: Theme): void {
  localStorage.setItem('lb_theme', theme);
  applyTheme(theme);
}

export function applyTheme(theme: Theme): void {
  document.documentElement.setAttribute('data-theme', theme);
}
