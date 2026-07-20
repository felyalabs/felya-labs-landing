import {
  colorTheme,
  prototypeVideoCover,
  language,
  mobileNavigation,
  developmentUpdatesFormConfig
} from './site-config.js';
import {
  priorityHeroLanguages,
  secondaryHeroLanguages
} from './hero-headline-translations.js';

export {
  colorTheme,
  prototypeVideoCover,
  language,
  mobileNavigation,
  developmentUpdatesFormConfig
} from './site-config.js';

export function getActiveLanguage(config = language) {
  const currentLanguage = document.documentElement.dataset.language;
  return config.languages.includes(currentLanguage) ? currentLanguage : config.defaultLanguage;
}

let activeTranslations;
export function translate(key) {
  if (!activeTranslations) {
    const source = document.querySelector('#felya-i18n')?.dataset.translations;
    try { activeTranslations = source ? JSON.parse(source) : {}; } catch { activeTranslations = {}; }
  }
  return activeTranslations[key] ?? key;
}

export function onDocumentReady(callback) {
  if (typeof document === 'undefined') return;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', callback, { once: true });
    return;
  }

  callback();
}

export function initColorTheme({ root = document, config = colorTheme } = {}) {
  const buttons = Array.from(root.querySelectorAll(config.selectors.buttons));
  if (!buttons.length) return;

  const isValidTheme = (theme) => config.themes.includes(theme);

  const readStoredTheme = () => {
    try {
      const storedTheme = window.localStorage.getItem(config.storageKey);
      return isValidTheme(storedTheme) ? storedTheme : config.defaultTheme;
    } catch {
      return config.defaultTheme;
    }
  };

  const persistTheme = (theme) => {
    try {
      window.localStorage.setItem(config.storageKey, theme);
    } catch {}
  };

  const applyTheme = (theme, shouldPersist = true) => {
    const nextTheme = isValidTheme(theme) ? theme : config.defaultTheme;
    const nextAction = nextTheme === 'dark' ? 'light' : 'dark';
    const labelKey = nextAction === 'light' ? 'theme.toLight' : 'theme.toDark';
    document.documentElement.dataset.theme = nextTheme;
    buttons.forEach((button) => {
      button.dataset.themeNext = nextAction;
      button.setAttribute('aria-pressed', String(nextTheme === 'light'));
      button.setAttribute('aria-label', translate(labelKey));
    });
    if (shouldPersist) persistTheme(nextTheme);
    document.dispatchEvent(new CustomEvent('felya:themechange', {
      detail: {
        theme: nextTheme,
        userInitiated: shouldPersist
      }
    }));
  };

  applyTheme(readStoredTheme(), false);

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const nextTheme = button.dataset.themeNext || (document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
      applyTheme(nextTheme);
    });
  });

  document.addEventListener('felya:languagechange', () => {
    applyTheme(document.documentElement.dataset.theme, false);
  });
}

export function initLanguageSelector({ root = document, config = language } = {}) {
  const dialog = root.querySelector(config.selectors.dialog);
  const openButtons = Array.from(root.querySelectorAll(config.selectors.openButtons));
  if (!dialog || !openButtons.length) return;

  let opener = null;
  const open = (button) => {
    opener = button;
    dialog.showModal();
    dialog.querySelector('[aria-current="page"]')?.focus();
  };
  const close = () => {
    dialog.close();
    opener?.focus();
  };

  openButtons.forEach((button) => button.addEventListener('click', () => open(button)));
  dialog.querySelectorAll(config.selectors.closeButtons).forEach((button) => button.addEventListener('click', close));
  dialog.addEventListener('click', (event) => { if (event.target === dialog) close(); });
  dialog.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    close();
  });
  dialog.addEventListener('close', () => opener?.focus());

  dialog.querySelectorAll(config.selectors.options).forEach((option) => {
    option.addEventListener('click', () => {
      const nextLanguage = option.dataset.languageOption;
      try { window.localStorage.setItem(config.storageKey, nextLanguage); } catch {}
      if (window.location.hash) option.href = `${option.href}${window.location.hash}`;
    });
  });
}

export function initThemeImages({ root = document } = {}) {
  const images = Array.from(root.querySelectorAll('[data-theme-image]'));
  if (!images.length) return;

  const applySources = () => {
    const theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    images.forEach((image) => {
      const nextSource = theme === 'dark' ? image.dataset.darkSrc : image.dataset.lightSrc;
      const nextSourceSet = theme === 'dark' ? image.dataset.darkSrcset : image.dataset.lightSrcset;
      if (nextSourceSet && image.getAttribute('srcset') !== nextSourceSet) image.setAttribute('srcset', nextSourceSet);
      if (nextSource && image.getAttribute('src') !== nextSource) image.setAttribute('src', nextSource);
    });
  };

  applySources();
  document.addEventListener('felya:themechange', applySources);
}

export function initHeroProductThemeTransition({ root = document } = {}) {
  const composites = Array.from(root.querySelectorAll('[data-hero-product-composite]'));
  if (!composites.length) return;

  const applyGloveTheme = (theme) => {
    const nextTheme = theme === 'dark' ? 'dark' : 'light';
    composites.forEach((composite) => {
      composite.dataset.gloveTheme = nextTheme;
    });
  };

  applyGloveTheme(document.documentElement.dataset.theme);

  document.addEventListener('felya:themechange', (event) => {
    const nextTheme = event.detail?.theme || document.documentElement.dataset.theme;
    applyGloveTheme(nextTheme);
  });
}

export function initTwoLineHeadings({ root = document } = {}) {
  const headings = Array.from(root.querySelectorAll([
    '.section-title',
    '.point-of-view-title',
    '.development-updates-title',
    '.contact-title',
    '.future-scenario__copy h3'
  ].join(', ')));
  if (!headings.length) return;

  let frame = 0;

  const fitsTwoLines = (heading) => {
    const styles = window.getComputedStyle(heading);
    const lineHeight = Number.parseFloat(styles.lineHeight);
    if (!Number.isFinite(lineHeight) || lineHeight <= 0) return true;
    const hasControlledLines = heading.querySelectorAll(':scope > .heading-line').length === 2;
    return (hasControlledLines || heading.scrollHeight <= (lineHeight * 2) + 4)
      && heading.scrollWidth <= heading.clientWidth + 1;
  };

  const fitHeading = (heading) => {
    heading.style.removeProperty('font-size');
    const naturalSize = Number.parseFloat(window.getComputedStyle(heading).fontSize);
    if (!Number.isFinite(naturalSize) || fitsTwoLines(heading)) return;

    let lower = Math.min(14, naturalSize);
    let upper = naturalSize;

    for (let index = 0; index < 10; index += 1) {
      const candidate = (lower + upper) / 2;
      heading.style.fontSize = `${candidate}px`;
      if (fitsTwoLines(heading)) lower = candidate;
      else upper = candidate;
    }

    heading.style.fontSize = `${lower}px`;
  };

  const fitAll = () => {
    window.cancelAnimationFrame(frame);
    frame = window.requestAnimationFrame(() => headings.forEach(fitHeading));
  };

  fitAll();
  document.fonts?.ready.then(fitAll);
  window.addEventListener('resize', fitAll, { passive: true });
  document.addEventListener('felya:languagechange', fitAll);
}

export function initMobileNavigation({ root = document, config = mobileNavigation } = {}) {
  const container = root.querySelector(config.selectors.container);
  if (!container) return;

  const toggle = container.querySelector('summary');
  const syncExpandedState = () => {
    toggle?.setAttribute('aria-expanded', String(container.open));
  };

  syncExpandedState();
  container.addEventListener('toggle', syncExpandedState);

  container.querySelectorAll(config.selectors.links).forEach((link) => {
    link.addEventListener('click', () => {
      container.removeAttribute('open');
    });
  });

  document.addEventListener('pointerdown', (event) => {
    if (!container.open) return;
    if (container.contains(event.target)) return;

    container.removeAttribute('open');
  }, { capture: true });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !container.open) return;

    container.removeAttribute('open');
  });
}

export function initHeroHeadlineLanguages({
  root = document,
  priority = priorityHeroLanguages,
  secondary = secondaryHeroLanguages,
  random = Math.random,
  idleTimings = {}
} = {}) {
  const hitbox = root.querySelector('[data-hero-headline-languages]');
  const headline = hitbox?.querySelector('.hero-headline-language-text');
  if (!hitbox || !headline || !priority.length || !secondary.length) return;

  hitbox.__felyaHeroHeadlineCleanup?.();

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const timings = {
    firstIdleDelay: 12000,
    idleDelayMin: 16000,
    idleDelayMax: 24000,
    longIdleDelayMin: 35000,
    longIdleDelayMax: 50000,
    languageHoldMin: 2000,
    languageHoldMax: 2600,
    ...idleTimings
  };
  const shuffle = (items) => {
    const result = [...items];
    for (let index = result.length - 1; index > 0; index -= 1) {
      const randomIndex = Math.floor(random() * (index + 1));
      [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
    }
    return result;
  };

  const englishLanguage = priority.find((entry) => entry.code === 'en');
  let priorityQueue = [];
  let secondaryQueue = [];
  let shouldShowEnglishFirst = false;
  let isEasterEggActive = false;
  let isPointerInside = false;
  let isFocused = false;
  let touchTapCount = 0;
  let ignoreTouchClickUntil = 0;
  let introRunId = 0;
  let isIntroActive = false;
  let transitionRunId = 0;
  let previewRunId = 0;
  let isPointerPreviewRunning = false;
  let idleRunId = 0;
  let automaticChangeCount = 0;
  let lastAutomaticLanguageCode = '';
  let interactionState = 'intro';
  let isDestroyed = false;
  const timers = new Map();
  const listeners = [];

  const setState = (state) => {
    interactionState = state;
    hitbox.dataset.heroLanguageState = state;
  };

  const randomBetween = (minimum, maximum) => minimum + (random() * (maximum - minimum));

  const wait = (duration, group) => new Promise((resolve) => {
    const timerId = window.setTimeout(() => {
      timers.delete(timerId);
      resolve(true);
    }, duration);
    timers.set(timerId, { group, resolve });
  });

  const cancelTimers = (group) => {
    timers.forEach((timer, timerId) => {
      if (group && timer.group !== group) return;
      window.clearTimeout(timerId);
      timers.delete(timerId);
      timer.resolve(false);
    });
  };

  const listen = (target, type, handler, options) => {
    target.addEventListener(type, handler, options);
    listeners.push(() => target.removeEventListener(type, handler, options));
  };

  const resetLanguageCycle = () => {
    const defaultText = translate(headline.dataset.i18n);
    shouldShowEnglishFirst = Boolean(englishLanguage && defaultText !== englishLanguage.text);
    priorityQueue = shuffle(priority).filter((entry) => (
      !shouldShowEnglishFirst || entry.code !== englishLanguage.code
    ));
    secondaryQueue = shuffle(secondary);
  };

  resetLanguageCycle();

  const fitHeadline = () => {
    headline.style.removeProperty('--hero-headline-scale');
    const availableWidth = hitbox.clientWidth;
    const contentWidth = headline.scrollWidth;
    const scale = availableWidth > 0 && contentWidth > availableWidth
      ? availableWidth / contentWidth
      : 1;
    headline.style.setProperty('--hero-headline-scale', String(scale));
  };

  const restoreHeadline = () => {
    headline.textContent = translate(headline.dataset.i18n);
    headline.removeAttribute('lang');
    headline.removeAttribute('dir');
    headline.removeAttribute('data-hero-language');
    fitHeadline();
  };

  const restoreEnglishHeadline = () => {
    if (!englishLanguage) {
      restoreHeadline();
      return;
    }

    headline.textContent = englishLanguage.text;
    headline.lang = englishLanguage.code;
    headline.dir = englishLanguage.dir || 'ltr';
    headline.dataset.heroLanguage = englishLanguage.name;
    fitHeadline();
  };

  const nextLanguage = () => {
    if (shouldShowEnglishFirst) {
      shouldShowEnglishFirst = false;
      return englishLanguage;
    }
    if (priorityQueue.length) return priorityQueue.shift();
    if (!secondaryQueue.length) secondaryQueue = shuffle(secondary);
    return secondaryQueue.shift();
  };

  const showNextLanguage = () => {
    let languageEntry = nextLanguage();
    const defaultText = translate(headline.dataset.i18n);
    if (languageEntry?.text === defaultText) languageEntry = nextLanguage();
    if (!languageEntry) return;

    headline.textContent = languageEntry.text;
    headline.lang = languageEntry.code;
    headline.dir = languageEntry.dir || 'ltr';
    headline.dataset.heroLanguage = languageEntry.name;
    fitHeadline();
  };

  const nextAutomaticLanguage = () => {
    const maximumAttempts = priority.length + secondary.length + 2;
    for (let attempt = 0; attempt < maximumAttempts; attempt += 1) {
      const entry = nextLanguage();
      if (!entry || entry.code === 'en' || entry.code === lastAutomaticLanguageCode) continue;
      return entry;
    }
    return null;
  };

  const cancelHeadlineTransition = () => {
    transitionRunId += 1;
    cancelTimers('transition');
    headline.classList.remove('hero-headline-language-text--intro-in', 'hero-headline-language-text--intro-out');
    hitbox.classList.remove('hero-headline-language-hitbox--idle-transition');
    if (!isIntroActive) hitbox.classList.remove('hero-headline-language-hitbox--animating');
  };

  const transitionHeadline = async (updateHeadline, { idle = false } = {}) => {
    cancelHeadlineTransition();

    if (reduceMotion.matches) {
      updateHeadline();
      return true;
    }

    const runId = ++transitionRunId;
    hitbox.classList.add('hero-headline-language-hitbox--animating');
    hitbox.classList.toggle('hero-headline-language-hitbox--idle-transition', idle);
    headline.classList.add('hero-headline-language-text--intro-out');

    if (!await wait(idle ? 130 : 140, 'transition') || runId !== transitionRunId) return false;

    updateHeadline();
    headline.classList.remove('hero-headline-language-text--intro-out');
    headline.classList.add('hero-headline-language-text--intro-in');

    if (!await wait(idle ? 190 : 210, 'transition') || runId !== transitionRunId) return false;

    headline.classList.remove('hero-headline-language-text--intro-in');
    hitbox.classList.remove('hero-headline-language-hitbox--animating');
    hitbox.classList.remove('hero-headline-language-hitbox--idle-transition');
    return true;
  };

  const showEasterEgg = () => {
    isEasterEggActive = true;
    setState('easter-egg');
    headline.textContent = 'Beyond Earth. ✨';
    headline.lang = 'en';
    headline.dir = 'ltr';
    headline.dataset.heroLanguage = 'Easter egg';
    fitHeadline();
  };

  const cancelIntro = () => {
    introRunId += 1;
    cancelTimers('intro');
    headline.classList.remove('hero-headline-language-text--intro-in', 'hero-headline-language-text--intro-out');
    hitbox.classList.remove('hero-headline-language-hitbox--animating');
    if (isIntroActive) restoreHeadline();
    isIntroActive = false;
  };

  const cancelIdle = () => {
    idleRunId += 1;
    cancelTimers('idle');
  };

  const cancelPreview = () => {
    previewRunId += 1;
    isPointerPreviewRunning = false;
    cancelTimers('preview');
  };

  const canRunIdle = () => (
    !isDestroyed
    && !reduceMotion.matches
    && !document.hidden
    && !isIntroActive
    && !isEasterEggActive
    && !isPointerInside
    && !isFocused
  );

  let scheduleIdle;

  const runIdleChange = async (runId) => {
    if (runId !== idleRunId || !canRunIdle()) return;

    const languageEntry = nextAutomaticLanguage();
    if (!languageEntry) {
      scheduleIdle(randomBetween(timings.idleDelayMin, timings.idleDelayMax));
      return;
    }

    setState('idle-active');
    lastAutomaticLanguageCode = languageEntry.code;
    const didShowLanguage = await transitionHeadline(() => {
      headline.textContent = languageEntry.text;
      headline.lang = languageEntry.code;
      headline.dir = languageEntry.dir || 'ltr';
      headline.dataset.heroLanguage = languageEntry.name;
      fitHeadline();
    }, { idle: true });
    if (!didShowLanguage || runId !== idleRunId || !canRunIdle()) return;

    if (!await wait(randomBetween(timings.languageHoldMin, timings.languageHoldMax), 'idle')) return;
    if (runId !== idleRunId || !canRunIdle()) return;

    const didRestore = await transitionHeadline(restoreHeadline, { idle: true });
    if (!didRestore || runId !== idleRunId || !canRunIdle()) return;

    automaticChangeCount += 1;
    const shouldTakeLongPause = automaticChangeCount >= 3;
    if (shouldTakeLongPause) automaticChangeCount = 0;
    setState('idle-waiting');
    scheduleIdle(randomBetween(
      shouldTakeLongPause ? timings.longIdleDelayMin : timings.idleDelayMin,
      shouldTakeLongPause ? timings.longIdleDelayMax : timings.idleDelayMax
    ));
  };

  scheduleIdle = (delay) => {
    cancelIdle();
    if (!canRunIdle()) return;
    setState('idle-waiting');
    const runId = idleRunId;
    wait(delay, 'idle').then((completed) => {
      if (completed) runIdleChange(runId);
    });
  };

  const scheduleNormalIdle = () => {
    scheduleIdle(randomBetween(timings.idleDelayMin, timings.idleDelayMax));
  };

  const claimManualInteraction = () => {
    cancelIdle();
    cancelHeadlineTransition();
    if (!isEasterEggActive) setState('interaction');
  };

  const showLanguageEntry = (languageEntry) => {
    if (!languageEntry) return;
    headline.textContent = languageEntry.text;
    headline.lang = languageEntry.code;
    headline.dir = languageEntry.dir || 'ltr';
    headline.dataset.heroLanguage = languageEntry.name;
    fitHeadline();
  };

  const runPointerPreview = async () => {
    cancelPreview();
    const runId = previewRunId;
    isPointerPreviewRunning = true;

    const didShowLanguage = await transitionHeadline(showNextLanguage);
    if (!didShowLanguage || runId !== previewRunId) {
      if (runId === previewRunId) isPointerPreviewRunning = false;
      return;
    }

    isPointerPreviewRunning = false;
    if (isPointerInside || isEasterEggActive) return;

    if (!await wait(40, 'preview') || runId !== previewRunId) return;
    await transitionHeadline(restoreHeadline);
    if (runId === previewRunId) scheduleNormalIdle();
  };

  const runThemePreview = async () => {
    if (isEasterEggActive) return;

    cancelIntro();
    cancelPreview();
    claimManualInteraction();
    const runId = previewRunId;
    const defaultText = translate(headline.dataset.i18n);
    let languageEntry = nextAutomaticLanguage();
    let attempts = priority.length + secondary.length;
    while (languageEntry?.text === defaultText && attempts > 0) {
      languageEntry = nextAutomaticLanguage();
      attempts -= 1;
    }
    if (!languageEntry) return;

    const didShowLanguage = await transitionHeadline(() => showLanguageEntry(languageEntry));
    if (!didShowLanguage || runId !== previewRunId) return;
    if (!await wait(40, 'preview') || runId !== previewRunId || isEasterEggActive) return;

    await transitionHeadline(restoreHeadline);
    if (runId === previewRunId) scheduleNormalIdle();
  };

  const playIntro = async (introLanguages) => {
    const runId = ++introRunId;
    if (!introLanguages.length) return;

    hitbox.classList.add('hero-headline-language-hitbox--animating');

    const waitForIntro = async (duration) => (
      await wait(duration, 'intro') && runId === introRunId
    );

    for (const entry of introLanguages) {
      headline.classList.add('hero-headline-language-text--intro-out');
      if (!await waitForIntro(140)) return;

      headline.textContent = entry.text;
      headline.lang = entry.code;
      headline.dir = entry.dir || 'ltr';
      headline.dataset.heroLanguage = entry.name;
      fitHeadline();
      headline.classList.remove('hero-headline-language-text--intro-out');
      headline.classList.add('hero-headline-language-text--intro-in');
      if (!await waitForIntro(210)) return;
      headline.classList.remove('hero-headline-language-text--intro-in');
      if (!await waitForIntro(40)) return;
    }

    headline.classList.add('hero-headline-language-text--intro-out');
    if (!await waitForIntro(140)) return;
    restoreHeadline();
    headline.classList.remove('hero-headline-language-text--intro-out');
    headline.classList.add('hero-headline-language-text--intro-in');
    if (!await waitForIntro(230)) return;
    headline.classList.remove('hero-headline-language-text--intro-in');
    hitbox.classList.remove('hero-headline-language-hitbox--animating');
    isIntroActive = false;
    setState('idle-waiting');
    scheduleIdle(timings.firstIdleDelay);
  };

  const scheduleIntro = async () => {
    if (reduceMotion.matches) {
      hitbox.removeAttribute('data-hero-intro-pending');
      restoreHeadline();
      setState('interaction');
      return;
    }

    const defaultText = translate(headline.dataset.i18n);
    const eligibleLanguage = (entry) => entry.code !== 'en' && entry.text !== defaultText;
    const introLanguages = [
      shuffle(priority.filter(eligibleLanguage))[0],
      ...shuffle(secondary.filter(eligibleLanguage)).slice(0, 2)
    ].filter(Boolean);
    if (!introLanguages.length) {
      hitbox.removeAttribute('data-hero-intro-pending');
      isIntroActive = false;
      scheduleIdle(timings.firstIdleDelay);
      return;
    }

    const firstLanguage = introLanguages.shift();
    headline.textContent = firstLanguage.text;
    headline.lang = firstLanguage.code;
    headline.dir = firstLanguage.dir || 'ltr';
    headline.dataset.heroLanguage = firstLanguage.name;
    isIntroActive = true;
    const runId = introRunId;
    fitHeadline();
    hitbox.removeAttribute('data-hero-intro-pending');

    await document.fonts?.ready;
    if (runId !== introRunId || isDestroyed) return;
    fitHeadline();
    if (await wait(600, 'intro') && runId === introRunId) playIntro(introLanguages);
  };

  const handleStandardActivation = async () => {
    cancelPreview();
    claimManualInteraction();
    if (isEasterEggActive) {
      isEasterEggActive = false;
      setState('interaction');
      await transitionHeadline(restoreHeadline);
      resetLanguageCycle();
      scheduleNormalIdle();
      return;
    }
    await transitionHeadline(showNextLanguage);
    scheduleNormalIdle();
  };

  const handlePointerDown = () => {
    cancelIntro();
    claimManualInteraction();
  };
  const handlePointerEnter = (event) => {
    if (event.pointerType === 'touch') return;
    isPointerInside = true;
    cancelIntro();
    claimManualInteraction();
    if (isEasterEggActive) return;
    runPointerPreview();
  };
  const handlePointerLeave = async (event) => {
    if (event.pointerType === 'touch') return;
    isPointerInside = false;
    if (isEasterEggActive) return;
    if (isPointerPreviewRunning) return;
    cancelPreview();
    claimManualInteraction();
    await transitionHeadline(restoreHeadline);
    scheduleNormalIdle();
  };
  const handlePointerUp = (event) => {
    if (event.pointerType !== 'touch') return;

    claimManualInteraction();
    ignoreTouchClickUntil = performance.now() + 700;
    touchTapCount += 1;
    cancelTimers('touch');

    if (touchTapCount === 1) handleStandardActivation();
    if (touchTapCount === 3) {
      transitionHeadline(showEasterEgg);
      touchTapCount = 0;
      return;
    }

    wait(500, 'touch').then((completed) => {
      if (completed) touchTapCount = 0;
    });
  };
  const handleClick = (event) => {
    if (performance.now() < ignoreTouchClickUntil) return;
    if (event.detail === 3) {
      claimManualInteraction();
      transitionHeadline(showEasterEgg);
      return;
    }
    if (event.detail > 1) return;
    handleStandardActivation();
  };
  const handleKeyDown = (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    cancelIntro();
    claimManualInteraction();
    event.preventDefault();
    handleStandardActivation();
  };
  const handleFocus = () => {
    isFocused = true;
    cancelIntro();
    claimManualInteraction();
  };
  const handleBlur = () => {
    isFocused = false;
    if (!isEasterEggActive) scheduleNormalIdle();
  };
  const handleResize = () => {
    if (headline.dataset.heroLanguage) fitHeadline();
  };
  const handleLanguageChange = () => {
    if (!isEasterEggActive) {
      cancelPreview();
      cancelIntro();
      cancelIdle();
      cancelHeadlineTransition();
      restoreHeadline();
      resetLanguageCycle();
      setState('intro');
      scheduleIntro();
    }
  };
  const handleThemeChange = (event) => {
    if (!event.detail?.userInitiated) return;
    runThemePreview();
  };
  const handleDocumentPointerDown = (event) => {
    if (isEasterEggActive || hitbox.contains(event.target)) return;

    if (document.activeElement === hitbox) hitbox.blur();
    isFocused = false;
    cancelIntro();
    claimManualInteraction();
    transitionHeadline(restoreEnglishHeadline).then(scheduleNormalIdle);
  };
  const handleVisibilityChange = () => {
    cancelIdle();
    if (document.hidden) {
      if (isIntroActive) cancelIntro();
      if (interactionState === 'idle-active') {
        cancelHeadlineTransition();
        restoreEnglishHeadline();
      }
      return;
    }
    if (!isEasterEggActive) scheduleNormalIdle();
  };
  const handleReducedMotionChange = () => {
    cancelIdle();
    if (reduceMotion.matches && interactionState === 'idle-active') {
      cancelHeadlineTransition();
      restoreEnglishHeadline();
      setState('interaction');
      return;
    }
    if (!reduceMotion.matches && !isEasterEggActive) scheduleNormalIdle();
  };

  listen(hitbox, 'selectstart', (event) => event.preventDefault());
  listen(hitbox, 'pointerdown', handlePointerDown);
  listen(hitbox, 'pointerenter', handlePointerEnter);
  listen(hitbox, 'pointerleave', handlePointerLeave);
  listen(hitbox, 'pointerup', handlePointerUp);
  listen(hitbox, 'click', handleClick);
  listen(hitbox, 'keydown', handleKeyDown);
  listen(hitbox, 'focus', handleFocus);
  listen(hitbox, 'blur', handleBlur);
  listen(window, 'resize', handleResize, { passive: true });
  listen(document, 'felya:languagechange', handleLanguageChange);
  listen(document, 'felya:themechange', handleThemeChange);
  listen(document, 'pointerdown', handleDocumentPointerDown);
  listen(document, 'visibilitychange', handleVisibilityChange);
  reduceMotion.addEventListener?.('change', handleReducedMotionChange);

  const cleanup = () => {
    isDestroyed = true;
    cancelPreview();
    cancelTimers();
    listeners.splice(0).forEach((removeListener) => removeListener());
    reduceMotion.removeEventListener?.('change', handleReducedMotionChange);
    cancelHeadlineTransition();
    hitbox.classList.remove('hero-headline-language-hitbox--animating', 'hero-headline-language-hitbox--idle-transition');
    hitbox.removeAttribute('data-hero-language-state');
    if (hitbox.__felyaHeroHeadlineCleanup === cleanup) delete hitbox.__felyaHeroHeadlineCleanup;
  };
  hitbox.__felyaHeroHeadlineCleanup = cleanup;
  listen(window, 'pagehide', cleanup, { once: true });

  fitHeadline();
  setState('intro');
  scheduleIntro();
}

export function setDevelopmentUpdatesStatus(statusElement, message, state = 'idle') {
  if (!statusElement) return;

  statusElement.textContent = message;
  statusElement.dataset.state = state;
}

export function initDevelopmentUpdatesForm({ root = document, config = developmentUpdatesFormConfig } = {}) {
  const form = root.querySelector(config.selectors.form);
  if (!form) return;

  const emailInput = form.querySelector(config.selectors.email);
  const submitButton = form.querySelector(config.selectors.submit);
  const status = root.querySelector(config.selectors.status);

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!emailInput || !submitButton || !status) return;
    if (!form.reportValidity()) return;

    submitButton.disabled = true;
    form.setAttribute('aria-busy', 'true');
    submitButton.textContent = translate('developmentUpdates.pendingButton');
    setDevelopmentUpdatesStatus(status, translate('developmentUpdates.pendingStatus'), 'idle');

    try {
      const payload = Object.fromEntries(new FormData(form).entries());
      const response = await fetch(form.action, {
        ...config.request,
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        form.reset();
        setDevelopmentUpdatesStatus(status, form.dataset.successMessage, 'success');
      } else {
        setDevelopmentUpdatesStatus(status, form.dataset.errorMessage, 'error');
      }
    } catch {
      setDevelopmentUpdatesStatus(status, form.dataset.errorMessage, 'error');
    } finally {
      submitButton.disabled = false;
      form.removeAttribute('aria-busy');
      submitButton.textContent = submitButton.dataset.label || translate('developmentUpdates.fallbackButton');
    }
  });
}

export function initPrototypeVideoCover({ root = document, config = prototypeVideoCover } = {}) {
  const covers = Array.from(root.querySelectorAll(config.selectors.cover));
  if (!covers.length) return;

  const loadVideoSources = (video) => {
    if (video.dataset.videoLoaded === 'true') return;

    video.querySelectorAll('source[data-src]').forEach((source) => {
      source.src = source.dataset.src;
      delete source.dataset.src;
    });
    video.dataset.videoLoaded = 'true';
    video.load();
  };

  covers.forEach((cover) => {
    const targetId = cover.dataset.videoTarget;
    const video = targetId ? document.getElementById(targetId) : cover.parentElement?.querySelector('video');
    if (!video) return;
    const frame = cover.closest('[data-video-frame]');
    const label = cover.querySelector('[data-video-play-label]');
    const playAriaLabel = cover.getAttribute('aria-label');
    const replayAriaLabel = cover.dataset.videoReplayLabel || playAriaLabel;

    const hideCover = () => {
      cover.hidden = true;
      frame?.setAttribute('data-video-state', 'playing');
    };

    const showCover = () => {
      video.pause();
      video.currentTime = 0;
      frame?.setAttribute('data-video-state', 'ready');
      cover.setAttribute('aria-label', replayAriaLabel);
      if (label) label.textContent = translate('prototypes.replayButton');
      cover.hidden = false;
    };

    frame?.setAttribute('data-video-state', 'ready');
    cover.setAttribute('aria-label', playAriaLabel);
    cover.hidden = false;
    cover.addEventListener('click', () => {
      loadVideoSources(video);
      frame?.setAttribute('data-video-state', 'loading');
      const playRequest = video.play();
      if (playRequest) {
        playRequest.catch(() => {
          frame?.setAttribute('data-video-state', 'ready');
          cover.hidden = false;
        });
      }
    });
    video.addEventListener('playing', hideCover);
    video.addEventListener('ended', showCover);
  });
}

export function initPrototypeFilmViewport({ root = document } = {}) {
  const stages = Array.from(root.querySelectorAll('.prototypes-film-stage'));
  if (!stages.length) return;

  stages.forEach((stage) => {
    stage.__felyaPrototypeFilmCleanup?.();

    const setActive = (active) => {
      stage.toggleAttribute('data-film-active', active);
    };

    if (!('IntersectionObserver' in window)) {
      setActive(true);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target === stage) setActive(entry.isIntersecting);
      });
    }, {
      rootMargin: '-28% 0px -28% 0px',
      threshold: 0.01
    });

    const cleanup = () => {
      observer.disconnect();
      stage.removeAttribute('data-film-active');
      if (stage.__felyaPrototypeFilmCleanup === cleanup) delete stage.__felyaPrototypeFilmCleanup;
    };

    stage.__felyaPrototypeFilmCleanup = cleanup;
    observer.observe(stage);
  });
}

export function initHeroMobileGloveScroll({ root = document } = {}) {
  const stages = Array.from(root.querySelectorAll('.hero-mobile-glove-stage'));
  if (!stages.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let frame = null;

  const reset = () => {
    stages.forEach((stage) => {
      stage.style.removeProperty('--hero-glove-y');
    });

    root.querySelectorAll('.hero-scroll-glove').forEach((glove) => {
      glove.style.removeProperty('transform');
    });
  };

  const update = () => {
    frame = null;

    if (reduceMotion.matches || window.innerWidth >= 768) {
      reset();
      return;
    }

    const travel = Math.min(360, window.innerHeight * 0.48);
    const progress = Math.min(Math.max(window.scrollY / travel, 0), 1);
    const offsetY = progress * -4;

    stages.forEach((stage) => {
      stage.style.setProperty('--hero-glove-y', `${offsetY.toFixed(2)}px`);
    });
  };

  const requestUpdate = () => {
    if (frame !== null) return;
    frame = window.requestAnimationFrame(update);
  };

  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  reduceMotion.addEventListener?.('change', requestUpdate);
}

export function initPatonSystemDemonstration({ root = document } = {}) {
  const demonstrations = Array.from(root.querySelectorAll('[data-system-demonstration]'));
  if (!demonstrations.length) return;

  demonstrations.forEach((demonstration) => {
    const triggers = Array.from(demonstration.querySelectorAll('[data-system-demo-trigger]'));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const awakeningDuration = 2300;
    const followUpDelayMin = 4000;
    const followUpDelayMax = 6500;
    const ambientDelayMin = 16000;
    const ambientDelayMax = 26000;
    const hapticVisualOnset = 35;
    const desktopSignalArrivalRatio = 0.82;
    const mobileSignalArrivalRatio = 0.96;
    let emphasisTimer = 0;
    let awakeningTimer = 0;
    let ambientTimer = 0;
    let isVisible = false;
    let isAwakening = false;
    let hasPlayedAmbientFollowUp = false;
    const activeSignalPulses = new Set();
    const activeSignalTimers = new Set();
    const activeHapticPulses = new Set();
    const activeHapticTimers = new Set();

    demonstration.dataset.awakening = 'pending';

    const clearAmbientAwakening = () => {
      window.clearTimeout(ambientTimer);
      ambientTimer = 0;
    };

    const getAmbientDelay = () => {
      const minimum = hasPlayedAmbientFollowUp ? ambientDelayMin : followUpDelayMin;
      const maximum = hasPlayedAmbientFollowUp ? ambientDelayMax : followUpDelayMax;
      return minimum + Math.random() * (maximum - minimum);
    };

    const scheduleAmbientAwakening = () => {
      clearAmbientAwakening();
      if (
        reduceMotion.matches
        || !isVisible
        || isAwakening
        || document.visibilityState !== 'visible'
      ) return;

      ambientTimer = window.setTimeout(() => {
        hasPlayedAmbientFollowUp = true;
        playAwakening({ restart: true });
      }, getAmbientDelay());
    };

    const finishAwakening = () => {
      window.clearTimeout(awakeningTimer);
      isAwakening = false;
      demonstration.removeAttribute('data-awakening');
      demonstration.removeAttribute('data-signal-origin');
      demonstration.dataset.awakened = 'true';
      demonstration.dataset.phase = 'rest';
      scheduleAmbientAwakening();
    };

    const clearSignalCycle = () => {
      activeSignalTimers.forEach((timer) => window.clearTimeout(timer));
      activeSignalTimers.clear();
      activeSignalPulses.forEach((pulse) => pulse.remove());
      activeSignalPulses.clear();
    };

    const clearHapticFeedback = () => {
      activeHapticTimers.forEach((timer) => window.clearTimeout(timer));
      activeHapticTimers.clear();
      activeHapticPulses.forEach((pulse) => pulse.remove());
      activeHapticPulses.clear();
    };

    const animateSignal = (direction, delay, duration) => {
      const launch = () => {
        const beamSelector = `.system-demonstration__beam--${direction}:not(.system-demonstration__beam--pulse)`;
        const beams = usesMobileSignalLoop()
          ? demonstration.querySelectorAll(`.system-demonstration__mobile-loop ${beamSelector}`)
          : demonstration.querySelectorAll(beamSelector);

        // The compact loop represents one physical signal travelling around
        // the system. Never leave an earlier point visible when the next half
        // of that journey begins.
        if (usesMobileSignalLoop()) {
          activeSignalPulses.forEach((pulse) => pulse.remove());
          activeSignalPulses.clear();
        }

        beams.forEach((beam) => {
          const pulse = beam.cloneNode(true);
          pulse.classList.add('system-demonstration__beam--pulse');
          pulse.style.setProperty('--system-signal-delay', '0ms');
          pulse.style.setProperty('--system-signal-duration', `${duration}ms`);
          beam.parentNode?.append(pulse);
          activeSignalPulses.add(pulse);

          window.setTimeout(() => {
            pulse.remove();
            activeSignalPulses.delete(pulse);
          }, duration + 100);
        });
      };

      if (delay <= 0) {
        launch();
        return;
      }

      const timer = window.setTimeout(() => {
        activeSignalTimers.delete(timer);
        launch();
      }, delay);
      activeSignalTimers.add(timer);
    };

    const playHapticFeedback = (selectors) => {
      if (reduceMotion.matches) return;
      const stack = demonstration.querySelector('.system-demonstration__operator-stack');
      if (!stack) return;

      selectors.forEach((selector) => {
        const source = stack.querySelector(`${selector}:not(.system-demonstration__operator-layer--feedback-pulse)`);
        if (!source) return;

        const pulse = source.cloneNode(true);
        pulse.classList.add('system-demonstration__operator-layer--feedback-pulse');
        stack.append(pulse);
        activeHapticPulses.add(pulse);

        window.setTimeout(() => {
          pulse.remove();
          activeHapticPulses.delete(pulse);
        }, 760);
      });
    };

    const playGloveFeedback = () => playHapticFeedback([
      '.system-demonstration__operator-layer--glove-left',
      '.system-demonstration__operator-layer--glove-right',
    ]);

    const playSuitFeedback = () => playHapticFeedback([
      '.system-demonstration__operator-layer--suit',
    ]);

    const scheduleHapticFeedback = (feedback, delay) => {
      if (delay <= 0) {
        feedback();
        return;
      }

      const timer = window.setTimeout(() => {
        activeHapticTimers.delete(timer);
        feedback();
      }, delay);
      activeHapticTimers.add(timer);
    };

    // Keep the animation source in lockstep with the CSS composition. A tall
    // or near-square viewport needs the compact loop even when it is wider
    // than a conventional tablet breakpoint.
    const usesMobileSignalLoop = () => window.matchMedia(
      '(max-width: 1099px), (max-aspect-ratio: 6 / 5)',
    ).matches;

    const getSignalArrivalDelay = (signalDelay, signalDuration) => {
      const arrivalRatio = usesMobileSignalLoop()
        ? mobileSignalArrivalRatio
        : desktopSignalArrivalRatio;
      return Math.round(signalDelay + signalDuration * arrivalRatio);
    };

    const scheduleHapticAtReturnArrival = (returnDelay, returnDuration) => {
      // Begin the transparent pulse just before the visible signal reaches the
      // operator so the first perceptible feedback frame lands with it.
      scheduleHapticFeedback(
        playSuitFeedback,
        Math.max(0, getSignalArrivalDelay(returnDelay, returnDuration) - hapticVisualOnset),
      );
    };

    const scheduleGlovesAtForwardStart = (forwardDelay) => {
      scheduleHapticFeedback(playGloveFeedback, forwardDelay);
    };

    const playSignalCycle = (origin = '') => {
      if (reduceMotion.matches) return;

      const isMobileSignalLoop = usesMobileSignalLoop();
      const forwardDuration = isMobileSignalLoop ? 400 : 820;
      const returnDuration = isMobileSignalLoop ? 380 : 720;

      if (origin === 'return') {
        animateSignal('return', 0, returnDuration);
        scheduleHapticAtReturnArrival(0, returnDuration);
        return;
      }

      if (origin === 'forward') {
        animateSignal('forward', 0, forwardDuration);
        const returnDelay = isMobileSignalLoop
          ? forwardDuration
          : getSignalArrivalDelay(0, forwardDuration);
        animateSignal('return', returnDelay, returnDuration);
        scheduleGlovesAtForwardStart(0);
        scheduleHapticAtReturnArrival(returnDelay, returnDuration);
        return;
      }

      const forwardDelay = isMobileSignalLoop ? 420 : 880;
      const returnDelay = getSignalArrivalDelay(forwardDelay, forwardDuration);
      animateSignal('forward', forwardDelay, forwardDuration);
      animateSignal('return', returnDelay, returnDuration);
      scheduleGlovesAtForwardStart(forwardDelay);
      scheduleHapticAtReturnArrival(returnDelay, returnDuration);
    };

    const playAwakening = ({ restart = false, origin = '', forceMobileRestart = false } = {}) => {
      if (reduceMotion.matches) {
        finishAwakening();
        return;
      }
      // Pointer, focus and click can fire as one interaction on touch devices.
      // Keep the compact mobile loop single-flight so exactly one signal point
      // completes its outward and return journey before another cycle begins.
      if (usesMobileSignalLoop() && isAwakening && !forceMobileRestart) return;
      if (!isVisible || (isAwakening && !restart)) return;

      window.clearTimeout(awakeningTimer);
      if (usesMobileSignalLoop() && forceMobileRestart) {
        clearSignalCycle();
        clearHapticFeedback();
      }
      clearAmbientAwakening();
      isAwakening = true;
      demonstration.removeAttribute('data-awakening');
      // Force a style flush so the same keyframes can restart on every interaction.
      void demonstration.offsetWidth;
      if (origin === 'forward' || origin === 'return') {
        demonstration.dataset.signalOrigin = origin;
      } else {
        demonstration.removeAttribute('data-signal-origin');
      }
      demonstration.dataset.awakening = 'playing';
      demonstration.dataset.phase = 'awakening';
      playSignalCycle(origin);
      awakeningTimer = window.setTimeout(finishAwakening, awakeningDuration);
    };

    const setEmphasis = (direction = '') => {
      window.clearTimeout(emphasisTimer);
      if (direction) demonstration.dataset.emphasis = direction;
      else demonstration.removeAttribute('data-emphasis');
      if (!direction && !isAwakening) scheduleAmbientAwakening();
    };

    const holdEmphasis = (direction) => {
      setEmphasis(direction);
      emphasisTimer = window.setTimeout(() => setEmphasis(), 1800);
    };

    triggers.forEach((trigger) => {
      const action = trigger.dataset.systemDemoTrigger;
      trigger.addEventListener('pointerenter', (event) => {
        if (event.pointerType === 'touch') return;
        setEmphasis(action);
        playAwakening({ restart: true, origin: action });
      });
      trigger.addEventListener('pointerleave', () => setEmphasis());
      trigger.addEventListener('focus', () => {
        if (window.matchMedia('(hover: none)').matches) return;
        setEmphasis(action);
        playAwakening({ restart: true, origin: action });
      });
      trigger.addEventListener('blur', () => setEmphasis());
      trigger.addEventListener('click', () => {
        holdEmphasis(action);
        playAwakening({
          restart: true,
          origin: action,
          forceMobileRestart: usesMobileSignalLoop(),
        });
      });
    });

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.target !== demonstration) return;
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) playAwakening({ restart: true });
        else if (!isVisible) clearAmbientAwakening();
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.32 });

    observer.observe(demonstration);

    const handlePreferenceChange = () => {
      const bounds = demonstration.getBoundingClientRect();
      isVisible = bounds.bottom > 0 && bounds.top < window.innerHeight;
      if (reduceMotion.matches) {
        clearAmbientAwakening();
        window.clearTimeout(awakeningTimer);
        clearSignalCycle();
        clearHapticFeedback();
        isAwakening = false;
        demonstration.removeAttribute('data-awakening');
        demonstration.dataset.awakened = 'true';
        demonstration.dataset.phase = 'rest';
      } else if (isVisible) {
        playAwakening({ restart: true });
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState !== 'visible') {
        clearAmbientAwakening();
      } else if (isVisible && !isAwakening) {
        scheduleAmbientAwakening();
      }
    };

    reduceMotion.addEventListener?.('change', handlePreferenceChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });
}

export function initSectionReveals({ root = document } = {}) {
  const elements = Array.from(root.querySelectorAll('.reveal-block'));
  if (!elements.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.dataset.revealed = 'true');
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.dataset.revealed = 'true';
      observer.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

  elements.forEach((element) => observer.observe(element));
}

export function initSectionNavigation({ root = document } = {}) {
  const links = Array.from(root.querySelectorAll('[data-nav-link][href^="#"]'));
  if (!links.length) return;

  const sections = links
    .map((link) => root.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length) return;

  const initialHash = window.location.hash;
  const hasInitialSectionHash = sections.some((section) => initialHash === `#${section.id}`);

  if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

  if (hasInitialSectionHash) {
    window.history.replaceState(window.history.state, '', `${window.location.pathname}${window.location.search}`);
  }

  window.scrollTo(0, 0);

  const finishInitialNavigation = () => {
    window.scrollTo(0, 0);
    window.requestAnimationFrame(() => window.scrollTo(0, 0));
  };

  window.addEventListener('pageshow', finishInitialNavigation, { once: true });
  if (document.readyState === 'complete') finishInitialNavigation();
  else window.addEventListener('load', finishInitialNavigation, { once: true });
}

export function initSite(root = document) {
  initColorTheme({ root });
  initThemeImages({ root });
  initHeroProductThemeTransition({ root });
  initLanguageSelector({ root });
  initTwoLineHeadings({ root });
  initMobileNavigation({ root });
  initHeroHeadlineLanguages({ root });
  initDevelopmentUpdatesForm({ root });
  initPrototypeVideoCover({ root });
  initPrototypeFilmViewport({ root });
  initHeroMobileGloveScroll({ root });
  initPatonSystemDemonstration({ root });
  initSectionReveals({ root });
  initSectionNavigation({ root });
}

if (typeof document !== 'undefined') {
  onDocumentReady(() => initSite());
}
