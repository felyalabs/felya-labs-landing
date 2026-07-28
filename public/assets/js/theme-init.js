try {
  const darkHourStart = 19;
  const darkHourEnd = 7;
  const storedTheme = window.localStorage.getItem('felya-labs-theme');

  if (storedTheme === 'dark' || storedTheme === 'light') {
    document.documentElement.dataset.theme = storedTheme;
    document.documentElement.dataset.themeSource = 'user';
  } else {
    const supportsColorScheme = typeof window.matchMedia === 'function';
    const prefersDark = supportsColorScheme
      && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const prefersLight = supportsColorScheme
      && window.matchMedia('(prefers-color-scheme: light)').matches;

    if (prefersDark || prefersLight) {
      document.documentElement.dataset.theme = prefersDark ? 'dark' : 'light';
      document.documentElement.dataset.themeSource = 'system';
    } else {
      const hour = new Date().getHours();
      const isNight = hour >= darkHourStart || hour < darkHourEnd;
      document.documentElement.dataset.theme = isNight ? 'dark' : 'light';
      document.documentElement.dataset.themeSource = 'time';
    }
  }
} catch {
  const hour = new Date().getHours();
  document.documentElement.dataset.theme = hour >= 19 || hour < 7 ? 'dark' : 'light';
  document.documentElement.dataset.themeSource = 'time';
}
