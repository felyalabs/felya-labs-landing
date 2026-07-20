try {
  const storedTheme = window.localStorage.getItem('felya-labs-theme');
  if (storedTheme === 'dark' || storedTheme === 'light') {
    document.documentElement.dataset.theme = storedTheme;
  }
} catch {}
